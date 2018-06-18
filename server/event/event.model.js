const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');


/**
 * Event Schema
 */
const EventSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  bar: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Bar',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  attendants: [{
    type: mongoose.Schema.Types.ObjectId, ref:'User'
  }]
});

EventSchema.index({ match: 1, bar: 1 }, { unique: true });


/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

OwnerSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === DUPLICATED_KEY_MONGO_ERROR_CODE) { 
    const message = ErrorMessages.ERROR_CREATE_EVENT;
    next(new APIError(message, httpStatus.BAD_REQUEST, true));
  } else {
    next(error);
  }
});

/**
 * Methods
 */

/**
 * Statics
 */
var populateQuery = [{path:'match'}, {path:'bar', select:'_id name'}];
EventSchema.statics = {
 /**
   * Get 'bar'
   * @param {ObjectId} id - The objectId of bar.
   * @returns {Promise<Bar, APIError>}
   */
  
  get(id) {
    return this.findById(id)
      .populate(populateQuery)
      .execPopulate()
      .exec()
      .then((bar) => {
        if (bar) {
          return bar;
        }
        const err = new APIError(ErrorMessages.BAR_NOT_FOUND, httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
};

/**
 * @typedef Event
 */
module.exports = mongoose.model('Event', EventSchema);
