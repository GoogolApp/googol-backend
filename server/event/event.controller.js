const Event = require('./event.model');
const User = require('../user/user.model');
const Bar = require('../bar/bar.model');
const matchService = require('../match/match.service');

const ErrorMessages = require('../helpers/ErrorMessages');

const REPUTATION_RISE_CREATE_EVENT = 5;

/**
 * Load event and append to req.
 */
function load(req, res, next, id) {
  try{
    Event.get(id)
    .then(async (event) => {
      cachedMatch = await matchService.getMatchById(event.match);
      event = event.toObject();
      event.match = cachedMatch;
      req.queryEvent = event;
      return next();
      })
      .catch(e => next(e));
  }catch(err){
    next(new Error(ErrorMessages.EVENT_NOT_FOUND + err.message))
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
            eventDistance.distance = Math.round(distance(req.query.latitude, req.query.longitude, event.bar.location.coordinates[0], event.bar.location.coordinates[1]));
            return eventDistance;
          });
          events.sort(compare);
          res.json(events)
        })
        .catch(e => next(e));
    })
    .catch(e => next(e));

}

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function compare(a,b) {
  if (a.distance < b.distance)
    return -1;
  if (a.distance > b.distance)
    return 1;
  return 0;
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
    cachedMatch = await matchService.getMatchById(req.body.matchId);
    if(req.body.userId){
      await _reputationAddition(req.body.userId, REPUTATION_RISE_CREATE_EVENT);
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