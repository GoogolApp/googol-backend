const Event = require('./event.model');
const User = require('../user/user.model');
const Bar = require('../bar/bar.model');

const matchService = require('../match/match.service');
const reputationController = require('../reputation/reputation.controller');

const ErrorMessages = require('../helpers/ErrorMessages');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');
const Utils = require('../helpers/Utils')


const REPUTATION_RISE_CREATE_EVENT = 5;

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
      const event = await _saveEventUser(req.body.matchId, req.body.barId, req.body.userId);
      let reputation = await reputationController.reputationCreateEvent(req.user._id);
      res.json({'repIncrement': reputation, 'event': event});
    } else if (req.user.role === 'owner'){
      const event = await _saveEventOwner(req.body.matchId, req.body.barId);
      res.json(event);
    }
  } catch (err) {
    next(err);
  }
}


/**
 * Save event by User
 * @returns {Promise.<*>}
 * @private
 */
function _saveEventUser (matchId, barId, userId) {
  const event = new Event({
    match: matchId,
    bar: barId,
    user: userId,
    state: 'CREATED_BY_USER'
  });
  return event.save();
}


/**
 * Save event by Owner 
 * @returns {Promise.<*>}
 * @private
 */
function _saveEventOwner (matchId, barId) {
  const event = new Event({
    match: matchId,
    bar: barId,
    user: userId,
    state: 'CREATED_BY_OWNER'
  });
  return event.save();
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

module.exports = { load, get, create, remove, list, geoList};