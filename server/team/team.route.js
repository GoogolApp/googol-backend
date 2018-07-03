const express = require('express');
const teamCtrl = require('./team.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/teams - Get list of all Teams */
  .get(teamCtrl.list);


router.route('/:teamId')
/** GET /api/teams/:teamId - Get a team by id */
  .get(teamCtrl.getTeamById);

module.exports = router;
