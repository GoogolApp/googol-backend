const Promise = require('bluebird');
const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');

const Fawn = require("fawn");
Fawn.init(mongoose);

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
    type: mongoose.Schema.Types.ObjectId
  }],
  reputation: {
    type: Number,
    default: 0
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  eventHistory: [{
    type: mongoose.Schema.Types.ObjectId // ref:'Event'
  }],
  followingBars: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Bar'
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

UserSchema.post('save', function (error, doc, next) {
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
  transform: function (doc, ret) {
    delete ret.password;
  }
};

/**
 * Methods
 */
UserSchema.method({
  comparePassword (reqPassword, userPassword) {
    return bcrypt.compareSync(reqPassword, userPassword)
  },

  followBar (barId) {
    return this.update({$addToSet: {followingBars: {_id: barId}}});
  },

  unfollowBar (barId) {
    return this.update({$pull: {followingBars: barId}}, {safe: true, new: true});
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
  },

  /**
   * Search for users
   * @param {ObjectId} keyword - The objectId of user.
   * @returns {Promise<User, APIError>}
   *
   */
  search(keyword,{ skip = 0, limit = 50 } = {}) {
    return this.find({username: { '$regex' : keyword, '$options' : 'i' }})
      .sort({ username: 1 })
      .skip(+skip)
      .limit(+limit)
      .select({ username: 1, _id: 1 })
      .exec();
  },

  //TODO: This must be an atomic operation, we must use Fown to achive this, but only after they resolve this issue: https://github.com/e-oj/Fawn/issues/59
  followUser (user, userToBeFollowedId) {
    /*var task = Fawn.Task();
    return task
      .update(this, {$push: {following: {_id: userToBeFollowedId}}})
      .update("User", {_id: userToBeFollowedId}, {$push: {followers: {_id: this._id} } })
      .run();*/

    return user.update({$addToSet: {following: {_id: userToBeFollowedId}}}).then(() => {
      return this.update({_id: userToBeFollowedId}, {$addToSet: {followers: {_id: user._id} } });
    });
  },

  unfollowUser (user, userToBeFollowedId) {
    return user.update({$pull: {following: userToBeFollowedId}}, {safe: true, new: true}).then(() => {
      return this.update({_id: userToBeFollowedId}, {$pull: {followers: user._id}}, {safe: true, new: true});
    });
  },

  followingUsers (id) {
    return this.findById(id)
    .populate({
      path: 'following',
      select: '_id username reputation'
    })
    .select({_id:1, username : 1, following:1})
    .exec()
  },

  followersUsers (id) {
    return this.findById(id)
    .populate({
      path: 'followers',
      select: '_id username reputation'
    })
    .select({_id:1, username : 1, followers:1})
    .exec()
  },

  addFavTeam(user, teamId) {
    return this.findByIdAndUpdate(user,
      { $addToSet: { favTeams: teamId } }, { safe: true, new: true })
    .exec();
  },

  removeFavTeam(user, teamId) {
    return this.findByIdAndUpdate(user, { $pull: { favTeams: teamId } }, { safe: true, new: true })
    .exec();
  }
  

};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema);
