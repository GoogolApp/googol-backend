const express = require('express');
const teamCtrl = require('./team.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/users - Get list of all Teams */
  .get(teamCtrl.list);

router.route('/:teamId')
  .get(teamCtrl.getTeamById);
module.exports = router;
