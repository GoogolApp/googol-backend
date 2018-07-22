const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');
const Bar = require('../bar/bar.model');
const States = require('./event.state.js'); 



const DUPLICATED_KEY_MONGO_ERROR_CODE = 11000;


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
  state: {
    type: String,
    enum : [States.CONFIRMED_BY_OWNER,States.CREATED_BY_OWNER, States.CREATED_BY_USER, States.DELETED_BY_USER, States.UNCONFIMED_BY_OWNER],
    default: 'CREATED_BY_USER'
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

EventSchema.pre('save', async function (next) {
  try {
    const barId = this.bar;
    const bar = await Bar.findOne(barId);
    if (bar!= null) {
      next();
    } else {
      next( new Error(ErrorMessages.BAR_NOT_FOUND));
    }
  } catch (err) {
    next(err);
  }

});

EventSchema.post('save', function (error, doc, next) {
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
EventSchema.method({
  addAttendant (userId) {
    this.attendants.forEach(user => {
      if(user._id.equals(userId)){
        throw new Error(ErrorMessages.ERROR_ADD_ATTENDANT);
      }
    })
    return this.update({$addToSet: {attendants: {_id: userId}}});
  },

  removeAttendant (userId) {
    found = false;
    this.attendants.forEach(user => {
      if(user._id.equals(userId)){
        found = true;
      }
    })
    if(found){
      return this.update({$pull: {attendants: userId}}, {safe: true, new: true});
    }else{
      throw new Error(ErrorMessages.ERROR_REMOVE_ATTENDANT);
    }
  },

  changeState (state) {
    return this.update({state: state}, {safe: true, new: true});
  }
});



/**
 * Statics
 */

EventSchema.statics = {
 /**
   * Get 'event'
   * @param {ObjectId} id - The objectId of event.
   * @returns {Promise<Event, APIError>}
   */
  
  get(id) {
    return this.findById(id)
      .populate([{path:'bar'}, {path:'attendants'}])
      .exec()
      .then((event) => {
        if (event) {
          return event;
        }
        const err = new APIError(ErrorMessages.EVENT_NOT_FOUND, httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List events in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of events to be skipped.
   * @param {number} limit - Limit number of events to be returned.
   * @returns {Promise<Events[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .populate([{path:'bar'}, {path:'attendants'}])
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

    /**
   * List events in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of events to be skipped.
   * @param {number} limit - Limit number of events to be returned.
   * @returns {Promise<Events[]>}
   * name distance/*/
  listGeolocation(barList, { skip = 0, limit = 50 } = {}) {
    return this.find({'bar': {$in: barList}})
      .populate([{path:'bar'}, {path:'attendants', select:'username email'}])
      .skip(+skip)
      .sort({distance: 1})
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef Event
 */
module.exports = mongoose.model('Event', EventSchema);
