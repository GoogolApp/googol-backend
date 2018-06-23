const express = require('express');

const validate = require('express-validation');
const paramValidation = require('./event.validator');

const eventCtrl = require('./event.controller');

const router = express.Router();

router.route('/')
  /** GET /api/event - Get simple list of events */
  .get(eventCtrl.list)

  /** POST /api/event - Create new events */
  .post(validate(paramValidation.createEvent), eventCtrl.create);

router.route('/geoList')
  /** GET /api/event - Get list of events using geo search */
  .get(eventCtrl.geoList)

router.route('/:eventId')
  /** GET /api/event - Get event populating attendants */
  .get(validate(paramValidation.getById), eventCtrl.get)

/** Load event when API with eventId route parameter is hit */
router.param('eventId', eventCtrl.load);

module.exports = router;