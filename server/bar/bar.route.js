const express = require('express');

const expressJwt = require('express-jwt');
const config = require('../../config/config');

const validate = require('express-validation');
const paramValidation = require('./bar.validator');
const authCtrl = require('../auth/auth.controller')

const barCtrl = require('./bar.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/bar - Get list of bars */
  .get(barCtrl.list)

  /** POST /api/bar - Create new bar */
  .post(validate(paramValidation.createBar), barCtrl.create);

router.route('/geosearch')
  /** GET /api/geoSearch - Get list of bars with localization */
  .get(barCtrl.geoSearch)

router.route('/search')
  /** GET /api/search - Get list of bars */
  .get(barCtrl.search)

router.route('/:barId')

  /** GET /api/:barId - Request a bar */
  .get(barCtrl.get)

  /** DELETE /api/:barId - Delete bar */
  .delete(barCtrl.remove);

router.route('/:barId/promo')
/** PATCH /api/users/:barId/promo - Edit bar promo */
  .patch([validate(paramValidation.editPromo), expressJwt({ secret: config.jwtSecret }), authCtrl.checkBarOwner], barCtrl.updateBarPromo);




/** Load bar when API with barId route parameter is hit */
router.param('barId', barCtrl.load);

module.exports = router;
