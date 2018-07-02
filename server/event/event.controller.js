const Event = require('./event.model');
const User = require('../user/user.model');
const Bar = require('../bar/bar.model');
const matchService = require('../match/match.service');

const ErrorMessages = require('../helpers/ErrorMessages');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');
const Utils = require('../helpers/Utils')


const REPUTATION_RISE_CREATE_EVENT = 5;
const REPUTATION_RISE_CONFIRM = 10;
const CONFIRM = "confirm";
REPUTATION_DECREASE_UNCONFIRM = -5;

/**
 * Load event and append to req.
 */
async function load (req, res, next, id) {
  try {
    let event = await Event.get(id)
    const cachedMatch = await matchService.getMatchById(event.match);
    event = event.toObject();
    event.match = cachedMatch;
    req.queryEvent = event;
    console.log(event);
    return next();
  } catch(err) {
    next(new Error(ErrorMessages.EVENT_NOT_FOUND + err.message));
  }
}

/**
 * Get Event
 * @returns {Event}
 */
function get(req, res) {
  return res.json(req.queryEvent);
}

/**
 * Get events list.
 * @property {number} req.query.skip - Number of events to be skipped.
 * @property {number} req.query.limit - Limit number of events to be returned.
 * @returns {Events[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Event.list({ limit, skip })
    .then(events => res.json(events))
    .catch(e => next(e));
}

/**
 * Search events
 * @property {number} req.query.latitude - Latitude of the point of the center of the search 
 * @property {number} req.query.longitude -  Longitude of the point of the center of the search 
 * @property {number} req.query.maxDistance - Radius from the point of the center of the search in kilometers 
 * @returns [{Event}]
 */
function geoList(req, res, next) {
  Bar.geolocationSearch('', req.query.latitude, req.query.longitude, req.query.maxDistance)
    .then((geoBarList) => {
      return Event.listGeolocation(geoBarList, req.query.latitude, req.query.longitude, req.query.maxDistance)
        .then(events => {
          events = events.map((event) => {
            const eventDistance =  event.toObject()
            eventDistance.distance = Math.round(Utils.distance(req.query.latitude, req.query.longitude, event.bar.location.coordinates[0], event.bar.location.coordinates[1]));
            return eventDistance;
          });
          events.sort(compare);
          res.json(events)
        })
        .catch(e => next(e));
    })
    .catch(e => next(e));

}

function compare(a,b) {
  return (a.distance - b.distance);
}

/**
 * Create new event
 * @property {string} req.body.matchId - The Id of a match.
 * @property {string} req.body.barId - The Id of a bar.
 * @property {string} req.body.userId - The Id of an User. Optional.
 * @returns {Event}
 */
async function create(req, res, next) {
  try {
    const cachedMatch = await matchService.getMatchById(req.body.matchId);
    const dateIsValid = matchService.isFutureMatch(cachedMatch);
    if (!dateIsValid) {
      const err = new APIError(ErrorMessages.INVALID_MATCH_DATE, httpStatus.BAD_REQUEST);
      return next(err);
    }
    if (req.user.role === 'user') {
      await _reputationAddition(req.user._id, REPUTATION_RISE_CREATE_EVENT);
    }
    _saveEvent(req.body.matchId, req.body.barId, req.body.userId)
      .then(event => res.json(event))
      .catch(e => next(e));
  } catch (err) {
    next(err);
  }
}


/**
 * Save event
 * @returns {Promise.<*>}
 * @private
 */
function _saveEvent (matchId, barId, userId) {
  const event = new Event({
    match: matchId,
    bar: barId,
    user: userId
  });
  return event.save();
}

/**
 * Increase or decrease a user reputation.
 * @returns {Promise.<*>}
 * @private
 */
async function _reputationAddition (userId, value) {
  try {
    const user = await User.get(userId);
    return user.reputationAddition(value);
  } catch (err) {
    const reputationError = new Error(ErrorMessages.ERROR_REPUTATION + err.message);
    throw reputationError;
  }
}

async function confirmation (req, res, next){ //Com findById no lugar de update talvez funcione melhor pq retorna o documento
  let event = await Event.get(req.queryEvent._id);
  const user = req.user;
  const operation = req.body.operation;
  try {
    event = await ( operation === CONFIRM ?
    _confirmEvent(event, user) :
    _unconfirmEvent(event, user));
    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function _confirmEvent (event, user){
  try{ 
    if (user.role === 'user') {
      await _reputationAddition(user._id, REPUTATION_RISE_CONFIRM);
    }
    return event.confirmUser(user._id);
  } catch (err) {
    throw err;
  }

}

async function _unconfirmEvent (event, userId){
  try{
    if (user.role === 'user') {
      await _reputationAddition(user._id, REPUTATION_DECREASE_UNCONFIRM);
    }
    return event.unconfirmUser(user._id);
  } catch (err) {
    throw err;
  }
}


/**
 * Delete event.
 * @returns {Event}
 */
function remove(req, res, next) {
  const event = req.queryEvent;
  event.remove()
    .then(deletedEvent => res.json(deletedEvent))
    .catch(e => next(e));
}




module.exports = { load, get, create, remove, list, geoList, confirmation};