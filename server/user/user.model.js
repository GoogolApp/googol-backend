const Promise = require('bluebird');
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');

const USERNAME_ON_ERROR_MESSAGE = 'username_1';
const DUPLICATED_KEY_MONGO_ERROR_CODE = 11000;

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  favTeams: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Team'
  }],
  reputation: {
    type: Number,
    Default: 0
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId // Following can be users or establishments
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  eventHistory: [{
    type: mongoose.Schema.Types.ObjectId // ref:'Event'
  }]

});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
UserSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, null, (errr, hash) => {
      user.password = hash;
      next();
    });
  });
});

UserSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === DUPLICATED_KEY_MONGO_ERROR_CODE) {
    const message = error.message.includes(USERNAME_ON_ERROR_MESSAGE) ?
      ErrorMessages.DUPLICATED_USERNAME :
      ErrorMessages.DUPLICATED_EMAIL;
    next(new APIError(message, httpStatus.BAD_REQUEST, true));
  } else {
    next(error);
  }
});

UserSchema.options.toJSON = {
  transform: function(doc, ret) {
    delete ret.password;
  }
};

/**
 * Methods
 */
UserSchema.method({
  comparePassword(reqPassword, userPassword) {
    return bcrypt.compareSync(reqPassword, userPassword)
  }
});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate({
        path: 'history', // To load history on main user page
        options: { limit: 5 }
      })
      .populate('favTeams') // select: 'imgSource', after implement team model
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError(ErrorMessages.USER_NOT_FOUND, httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get user by email
   * @param {ObjectId} id - The email of user.
   * @returns {Promise<User, APIError>}
   */
  getByEmail(userEmail) {
    return this.findOne({
      email: userEmail
    }).exec();
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema);
