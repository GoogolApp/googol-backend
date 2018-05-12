const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const teamCtrl = require('./team.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/users - Get list of users */
  .get(teamCtrl.list)

  /** POST /api/team - Create new team */
  .post(validate(paramValidation.createTeam), teamCtrl.create);

module.exports = router;
