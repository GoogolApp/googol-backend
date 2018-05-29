const express = require('express');

const matchCtrl = require('./match.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/matches - Get list of matches from next week */
  .get(matchCtrl.getMatches);

module.exports = router;
