const express = require('express');

const matchCtrl = require('./match.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
/** GET /api/matches - Get list of matches from next week */
  .get(matchCtrl.getMatches);


router.route('/:matchId')
/** GET /api/matches/:matchId - Get a Match by id */
  .get(matchCtrl.getMatchById);

module.exports = router;
