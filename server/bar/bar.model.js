const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');


/**
 * Bar Schema
 */
const BarSchema = new mongoose.Schema({
  placeId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
  },
  location: {
    type: { type: String },
    coordinates: [Number]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  banner: {
    type: String,
  },
  promo: {
    type: String,
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  eventHistory: [{
    type: mongoose.Schema.Types.ObjectId // ref:'Event' or Game
  }]
});

BarSchema.index({ "location": "2dsphere" });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */


/**
 * Methods
 */


/**
 * Statics
 */
BarSchema.statics = {
  /**
   * Get 'bar'
   * @param {ObjectId} id - The objectId of bar.
   * @returns {Promise<Bar, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('eventHistory')
      .exec()
      .then((bar) => {
        if (bar) {
          return bar;
        }
        const err = new APIError(ErrorMessages.BAR_NOT_FOUND, httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List bars in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of bars to be skipped.
   * @param {number} limit - Limit number of bars to be returned.
   * @returns {Promise<Bar[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  /**
   * Search for bars with geolocalization
   * @param {ObjectId} keyword - The name to search for.
   * @param {ObjectId} latitude - Latitude of the point of the center of the search 
   * @param {ObjectId} longitude - Latitude of the point of the center of the search 
   * @param {ObjectId} maximumDistance - range of search- Optional
   * @returns {Promise<Bar, APIError>}
   * 
   */
  geolocationSearch(keyword, latitude = 0, longitude = 0, maximumDistance = 50000, { skip = 0, limit = 50 } = {}) {
    return this.find({name: { '$regex' : keyword, '$options' : 'i' }})
      .where('location').near({ center: { coordinates: [longitude, latitude], type: 'Point' }, maxDistance: maximumDistance*1000})
      .skip(+skip)
      .limit(+limit)
      .select({ name: 1, _id: 1, placeId: 1})
      .exec();
  },

  /**
   * Search for bares
   * @param {ObjectId} keyword - The objectId of bar.
   * @returns {Promise<User, APIError>}
   *
   */
  search(keyword,{ skip = 0, limit = 50 } = {}) {
    return this.find({name: { '$regex' : keyword, '$options' : 'i' }})
      .sort({ name: 1 })
      .skip(+skip)
      .limit(+limit)
      .select({ name: 1, _id: 1})
      .exec();
  }
};

/**
 * @typedef Bar
 */
module.exports = mongoose.model('Bar', BarSchema);
