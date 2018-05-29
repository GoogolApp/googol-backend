const express = require('express');

const validate = require('express-validation');
const paramValidation = require('./owner.validator');

const ownerCtrl = require('./owner.controller');
const authCtrl = require('../auth/auth.controller');

const expressJwt = require('express-jwt');
const config = require('../../config/config');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** LIST /api/owner/ - List all owners */
  .get(ownerCtrl.list)

  /** POST /api/owner - Create new owner */
  .post(validate(paramValidation.createOwner), ownerCtrl.create);

router.route('/:ownerId')

  /** GET /api/owner/:ownerId - Request a bar */
  .get(ownerCtrl.get)

router.route('/:ownerId/myBar')

  /** PUT /api/owner - Request a bar */
  .put([validate(paramValidation.setMyBar), expressJwt({ secret: config.jwtSecret }),  authCtrl.checkOwner], ownerCtrl.setMyBar)

/** Load owner when API with ownerId route parameter is hit */
router.param('ownerId', ownerCtrl.load);


/** POST /api/owner/promo -  */
/** POST /api/owner/banner -  */

module.exports = router;