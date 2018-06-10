const Promise = require('bluebird');
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');

const DUPLICATED_KEY_MONGO_ERROR_CODE = 11000;
const BAR_ON_ERROR_MESSAGE = 'bar';

/**
 * Owner Schema
 * Dono de bar
 */
const OwnerSchema = new mongoose.Schema({
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
  bar: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Bar',
    unique: true,
    sparse: true
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
OwnerSchema.pre('save', function (next) {
  const owner = this;
  if (!owner.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(owner.password, salt, null, (errr, hash) => {
      owner.password = hash;
      next();
    });
  });
});

OwnerSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === DUPLICATED_KEY_MONGO_ERROR_CODE) { 
    const message = error.message.includes(BAR_ON_ERROR_MESSAGE) ?
      ErrorMessages.BAR_TAKEN :
      ErrorMessages.DUPLICATED_EMAIL;
    next(new APIError(message, httpStatus.BAD_REQUEST, true));
  } else {
    next(error);
  }
});

OwnerSchema.options.toJSON = {
  transform: function (doc, ret) {
    delete ret.password;
  }
};

/**
 * Methods
 */
OwnerSchema.method({
  comparePassword(reqPassword, ownerPassword) {
    return bcrypt.compareSync(reqPassword, ownerPassword)
  }
});

/**
 * Statics
 */
OwnerSchema.statics = {
  /**
   * Get owner
   * @param {ObjectId} id - The objectId of owner.
   * @returns {Promise<Owner, APIError>}
   */
  get(id) {
    return this.findById(id)

      .populate('bar')
      .exec()
      .then((owner) => {
        if (owner) {
          return owner;
        }
        const err = new APIError(ErrorMessages.OWNER_NOT_FOUND, httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get owner by email
   * @param {ObjectId} id - The email of owner.
   * @returns {Promise<Owner, APIError>}
   */
  getByEmail(ownerEmail) {
    return this.findOne({
      email: ownerEmail
    }).exec();
  },

  /**
   * List owners in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of owners to be skipped.
   * @param {number} limit - Limit number of owners to be returned.
   * @returns {Promise<Owner[]>}
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
 * @typedef Owner
 */
module.exports = mongoose.model('Owner', OwnerSchema);
