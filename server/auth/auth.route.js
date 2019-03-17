const express = require('express');

const validate = require('express-validation');
const paramValidation = require('./auth.validator');
const authCtrl = require('./auth.controller');
const router = express.Router(); // eslint-disable-line new-cap

const expressJwt = require('express-jwt');
const config = require('../../config/config');

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login')
  .post(validate(paramValidation.login), authCtrl.login);

router.route('/ownerLogin')
  .post(validate(paramValidation.login), authCtrl.ownerLogin);

router.route('/recoverPassword')
  .post(validate(paramValidation.passwordRecovery), authCtrl.sendRecoveryPasswordMail);

router.route('/changePassword')
  .post([validate(paramValidation.passwordChange), expressJwt({ secret: config.jwtSecret })], authCtrl.changePassword);

module.exports = router;
