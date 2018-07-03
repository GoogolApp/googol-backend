const matchService = require('./match.service');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');

const ONE_WEEK = 7;

/**
 * Get all the matches that will occur seven days from the present day.
 *
 * @private
 */
const _getMatchesFromWeek = () => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const todayPlusSevenDays = new Date();
  todayPlusSevenDays.setDate(todayPlusSevenDays.getDate() + ONE_WEEK);
  todayPlusSevenDays.setHours(23,59,59,999);

  return matchService.getMatchesByTimeInterval(today, todayPlusSevenDays);
};

/**
 * Get all the matches that will occur seven days from the present day.
 */
const getMatches = (req, res, next) => {
  _getMatchesFromWeek()
    .then(matches => res.json(matches))
    .catch(err => next(new APIError(ErrorMessages.ERROR_RETRIEVING_MATCHES, httpStatus.INTERNAL_SERVER_ERROR, true)));
};

const getMatchById = async (req, res, next) => {
  const matchId = req.params.matchId;
  try {
    const match = await matchService.getMatchById(matchId);
    res.json(match);
  } catch (err) {
    next(err);
  }
};

module.exports = {getMatches, getMatchById};
