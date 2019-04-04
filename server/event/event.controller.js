const Event = require('./event.model');
const User = require('../user/user.model');
const Bar = require('../bar/bar.model');
const Owner = require('../owner/owner.model');


const matchService = require('../match/match.service');
const reputationController = require('../reputation/reputation.controller');

const ErrorMessages = require('../helpers/ErrorMessages');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');
const Utils = require('../helpers/Utils')
const States = require('./event.state.js');



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
async function list(req, res, next) {
  try{
    const { limit = 50, skip = 0 } = req.query;
    let events = await Event.list({ limit, skip });
    events = events.map((event) => {
      return matchService.getMatchById(event.match).then((cachedMatch) => {
        const eventMatch = event.toObject();
        eventMatch.match = cachedMatch;
        return eventMatch;
      });
    });
    events = await Promise.all(events);
    events.sort(compare);
    res.json(events);
  } catch (err) {
    next(err);
  }
}

/**
 * Search events
 * @property {number} req.query.latitude - Latitude of the point of the center of the search
 * @property {number} req.query.longitude -  Longitude of the point of the center of the search
 * @property {number} req.query.maxDistance - Radius from the point of the center of the search in kilometers
 * @returns [{Event}]
 */
async function geoList(req, res, next) {
  try {
    const {latitude, longitude, maxDistance} = req.query;
    const geoBarList = await Bar.geolocationSearch('', latitude, longitude, maxDistance);
    let events = await Event.listGeolocation(geoBarList, latitude, longitude, maxDistance);
    events = events.map((event) => {
      return matchService.getMatchById(event.match).then((cachedMatch) => {
        const eventDistance = event.toObject();
        eventDistance.match = cachedMatch;
        const [coord1, coord2] = event.bar.location.coordinates;
        eventDistance.distance = Math.round(Utils.distance(latitude, longitude, coord1, coord2));
        return eventDistance;
      });
    });
    events = await Promise.all(events);
    events.sort(compare);
    res.json(events);
  } catch (err) {
    next(err);
  }
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
      const event = await _saveEventUser(req.body.matchId, req.body.barId, req.user._id);
      let reputation = await reputationController.reputationCreateEvent(req.user._id);
      res.json({'repIncrement': reputation, 'event': event});
    } else if (req.user.role === 'owner') {
      const event = await _saveEventOwner(req.body.matchId, req.body.barId, req.user._id);
      res.json(event);
    }
  } catch (err) {
    next(err);
  }
}


/**
 * Save event by User
 * @private
 * @returns {Promise.<*>}
 */
function _saveEventUser (matchId, barId, userId) {
  const event = new Event({
    match: matchId,
    bar: barId,
    user: userId,
    state: States.CREATED_BY_USER
  });
  return event.save();
}


/**
 * Save event by Owner 
 * @returns {Promise.<*>}
 * @private
 * @returns {Promise.<*>}
 */
function _saveEventOwner (matchId, barId, userId) {
  const event = new Event({
    match: matchId,
    bar: barId,
    state: States.CREATED_BY_OWNER
  });
  return event.save();
}


/**
 * Confirm or unconfirm event.
 * Can be used by owner to confirm an event.
 * @property {string} req.body.operation 
 * @property {User} req.user 
 * @returns {ConfirmationObj}
 */
async function confirmUnconfirm(req, res, next) {
  try {
    const event = req.queryEvent;
    let reqUser = req.user; 
    let confirmationObj = {};  
    const operation = req.body.operation;
    switch (operation) {
      case "confirm":
        confirmationObj = await _userConfirm (reqUser, event);
        break;
      case "unconfirm":
        confirmationObj = await _userUnconfirm (reqUser, event);
        break;
      case "confirmedByOwner":
        confirmationObj = await _ownerConfirm (reqUser, event);
        break;
      case "unconfirmedByOwner":
        confirmationObj = await _ownerUnconfirm (reqUser, event);
        break;
      default:
        throw new APIError(ErrorMessages.INVALID_OPERATION, httpStatus.BAD_REQUEST);
    }
    res.json(confirmationObj);
  } catch(err) {
    next(err);
  }
}

/**
 * Add uset to event attendants list
 * Add reputation to creator and attendant 
 * @param attendant
 * @param event 
 * @private 
 * @returns {Promise.<*>}
 */
async function _userConfirm (attendant, event) {
  try {
    const createdBy = event.user;
    const eventMongoObj = await Event.get(event._id);
    await eventMongoObj.addAttendant(attendant._id);
    const reputation = await reputationController.reputationNewAttendant(createdBy, attendant._id);
    return {'repIncrement': reputation, 'event': event};
  } catch(err) {
    throw(err);
  }
}

/**
 * Remove user to attendants on the event
 * Remove reputation from attendant and creator
 * @returns {Promise.<*>}
 * @param attendant
 * @param event
 * @private 
 */
async function _userUnconfirm (attendant, event) {
  try {
    const createdBy = event.user;
    const eventMongoObj = await Event.get(event._id);
    await eventMongoObj.removeAttendant(attendant._id);
    const reputation = await reputationController.reputationRemoveAttendant(createdBy, attendant._id);
    return {'repIncrement': reputation, 'event': event};
  } catch(err) {
    throw(err);
  }
}

/**
 * Change state of the event to CONFIRMED_BY_OWNER 
 * Add reputation for the creator of the Event 
 * @param owner
 * @param event 
 * @private
 * @returns {Promise.<*>}
 */
async function _ownerConfirm (owner, event) {
  try {
    const createdBy = event.user;
    const eventMongoObj = await Event.get(event._id);
    const ownerBar = await Owner.get(owner._id);
    if (!ownerBar.bar._id.equals(event.bar._id)) {
      throw new APIError(ErrorMessages.FORBIDDEN_OPERATION, httpStatus.FORBIDDEN);
    }
    await eventMongoObj.changeState(States.CONFIRMED_BY_OWNER);
    await reputationController.reputationOwnerConfirm(createdBy);
    return event;
  } catch(err) {
    throw(err);
  }
}

/**
 * Change state of the event to UNCONFIRMED_BY_OWNER 
 * Remove reputation for the creator of an Event if the owner unconfirm
 * @param owner
 * @param event 
 * @private
 * @returns {Promise.<*>}
 */
async function _ownerUnconfirm (owner, event) {
  try {
    const createdBy = event.user;
    const eventMongoObj = await Event.get(event._id);
    const ownerBar = await Owner.get(owner._id);
    if (!ownerBar.bar._id.equals(event.bar._id)) {
      throw new APIError(ErrorMessages.FORBIDDEN_OPERATION, httpStatus.FORBIDDEN);
    }
    await eventMongoObj.changeState(States.UNCONFIMED_BY_OWNER);
    await reputationController.reputationOwnerUnconfirm(createdBy);
    return event;
  } catch(err) {
    throw(err);
  }
}


/**
 * Delete event. used by 
 * @returns {Event}
 */
async function remove(req, res, next) {
  try {
    const event = req.queryEvent;
    const eventMongoObj = await Event.get(event._id);
    const attendantsLen = event.attendants.length;
    if (req.user.role === 'user') {
      response = await _userRemove(eventMongoObj, attendantsLen, req.user);
    } else if (req.user.role === 'owner') {
      response = await _ownerRemove(eventMongoObj, attendantsLen, req.user);
    }
    return res.json(response);
  } catch(err) {
    next(err);
  }
}


/**
 * Remove an event, do not remove 4 real, only change state
 * @param event
 * @param attendantsLen 
 * @param reqUser 
 * 
 * @private
 * @returns {Promise.<*>}
 */
async function _userRemove(event, attendantsLen, reqUser) {
  try {
    const createdBy = event.user;
    if (event.state === States.CONFIRMED_BY_OWNER) {
      throw new APIError(ErrorMessages.FORBIDDEN_OPERATION_CONFIRMED, httpStatus.FORBIDDEN);
    } else if(!event.user.equals(reqUser._id)){
      throw new APIError(ErrorMessages.FORBIDDEN_OPERATION_EVENT, httpStatus.FORBIDDEN);
    }
    await reputationController.reputationUserRemove(createdBy, attendantsLen);
    await event.remove();
    return event;
  } catch (err){
    throw err;
  }
}

/**
 * Remove an event, do not remove 4 real, only change state
 * @param event
 * @param attendantsLen 
 * @param reqUser 
 * 
 * @private
 * @returns {Promise.<*>}
 */
async function _ownerRemove(event, attendantsLen, reqUser) {
  try {
    const createdBy = event.user;
    const ownerBar = await Owner.get(reqUser._id);
    if(!ownerBar.bar._id.equals(event.bar._id)){
      throw new APIError(ErrorMessages.FORBIDDEN_OPERATION, httpStatus.FORBIDDEN);
    }
    await reputationController.reputationOwnerUnconfirm(createdBy, attendantsLen);
    await event.changeState(States.UNCONFIMED_BY_OWNER);
    return event;
  } catch (err){
    throw err;
  }
}


/**
 * Get events created by an User
 * @returns {[Event()]}
 */
function getCreateBy(req, res, next){
  Event.getCreateBy(req.params.userId)
  .then((events) => {
    return res.json(events);
  })
  .catch(e => next(e));
}

/**
 * Get events from an User following Users
 * @returns {[Event()]}
 */
async function getFollowingUsers(req, res, next){
  try{
    let events = await _followingUsers( req.params.userId );
    return res.json( events );
  }catch(err){
    next(err);
  }

}

async function _followingUsers(userId){
  try{
    const usersWithFollowing = await User.followingUsers(userId);
    const usersWithFollowingObj = usersWithFollowing.toObject();
    const following = usersWithFollowingObj.following;
    const followingUsersId = await following.map((user) => {
      return user._id;
    });
    let events = await Event.getFollowingUsers(followingUsersId);
    events = events.map((event) => {
      return matchService.getMatchById(event.match).then((cachedMatch) => {
        const eventMatch = event.toObject();
        eventMatch.match = cachedMatch;
        return eventMatch;
      });
    });
    events = await Promise.all(events);
    return events;
  }catch(err){
    next(err);
  }
}

/**
 * Get events from an User following bars
 * @returns {[Event()]}
 */
async function getFollowingBars(req, res, next){
  try{
    let events = await _followingBars(req.params.userId);
    return res.json(events);
  }catch(err){
    next(err);
  }
}

async function _followingBars(userId){
  try {
    let followingBars = await User.getFollowingBarsPromo(userId);
    followingBars = followingBars.toObject();
    const followingBarsId = await followingBars.map((bar) => {
      return bar._id;
    });
    let events = await Event.getFollowingBars(followingBarsId);
    events = events.map((event) => {
      return matchService.getMatchById(event.match).then((cachedMatch) => {
        const eventMatch = event.toObject();
        eventMatch.match = cachedMatch;
        return eventMatch;
      });
    });
    events = await Promise.all(events);
    return events;
  } catch (err){
    next(err);
  }

}

/**
 * Get events from an User following users and bars
 * @returns {[Event()]}
 */
async function getFollowingFeed(req, res, next){
  try{
    let eventsBars = await _followingBars(req.params.userId);
    let eventsUsers = await _followingUsers( req.params.userId );
    events = eventsBars.concat(eventsUsers);
    return res.json(events);
  }catch(err){
    next(err);
  }
}

module.exports = { load, get, create, remove, list, geoList, confirmUnconfirm, getCreateBy, getFollowingUsers, getFollowingBars, getFollowingFeed};

