const express = require('express');

const validate = require('express-validation');
const paramValidation = require('./event.validator');

const authCtrl = require('../auth/auth.controller');
const eventCtrl = require('./event.controller');

const expressJwt = require('express-jwt');
const config = require('../../config/config');

const router = express.Router();

router.route('/')
  /** GET /api/events - Get simple list of events */
  .get(eventCtrl.list)

  /** POST /api/event - Create new events */
  .post([validate(paramValidation.createEvent), expressJwt({ secret: config.jwtSecret })], eventCtrl.create);

router.route('/geoList')
  /** GET /api/events/geoList - Get list of events using geo search */
  .get(validate(paramValidation.geoList), eventCtrl.geoList);

router.route('/:eventId')
  /** GET /api/events/:eventid - Get event populating attendants */
  .get(validate(paramValidation.getById), eventCtrl.get)

  /** PATCH /api/events/:eventid  - Confirm or unconfirm event. Route used by user and owner */
  .patch([validate(paramValidation.confirmUnconfirm), expressJwt({ secret: config.jwtSecret })], eventCtrl.confirmUnconfirm)

  /** DELETE /api/events/:eventId - Delete an event. Route usey by user and owner */
  .delete([validate(paramValidation.deleteEvent), expressJwt({ secret: config.jwtSecret })], eventCtrl.remove);

router.route('/createdBy/:userId')
  /** GET /api/events/:eventid/createdBy - Get events created by me*/
  .get(validate(paramValidation.getCreateBy), eventCtrl.getCreateBy)

router.route('/followingUsers/:userId')
  /** GET /api/events/followingUsers/:userId - Get events that my folloring users confirmed */
  .get(validate(paramValidation.getFollowingUsers), eventCtrl.getFollowingUsers)

router.route('/followingBars/:userId')
  /** GET /api/events/followingBars/:userId - Get events from bars the user follow */
  .get(validate(paramValidation.getFollowingBars), eventCtrl.getFollowingBars)
 
router.route('/feed/:userId')
  /** GET /api/events/feed/:userId - Get events from bars the user follow */
  .get(validate(paramValidation.getFollowingFeed), eventCtrl.getFollowingFeed)

/** Load event when API with eventId route parameter is hit */
router.param('eventId', eventCtrl.load);

module.exports = router;