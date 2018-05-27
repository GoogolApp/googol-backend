const express = require('express');

const validate = require('express-validation');
const paramValidation = require('./bar.validator');

const barCtrl = require('./bar.controller');

const expressJwt = require('express-jwt');
const config = require('../../config/config');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/bar - Get list of bars */
  .get(barCtrl.list)

  /** POST /api/bar - Create new bar */
  .post(validate(paramValidation.createBar), barCtrl.create);

router.route('/search')
  /** GET /api/search - Get list of bars */
  .get(barCtrl.search)

router.route('/:barId')

  /** GET /api/:barId - Request a bar */
  .get(barCtrl.get)

/** Load bar when API with barId route parameter is hit */
router.param('barId', barCtrl.load);

module.exports = router;