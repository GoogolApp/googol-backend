const cache = require('memory-cache');
const wltdoFacade = require('../helpers/whoLetTheDogsOut.facade');

const EIGHT_HOURS_IN_MS = 1000 * 60 * 60 * 8;
const ONE_DAY_IN_MS = EIGHT_HOURS_IN_MS * 3;

const matchesCache = new cache.Cache();

/**
 * Get a match by id from cache and if is not there from Who Let the Dogs Out.
 *
 * @param matchId
 *
 * @returns {Promise<Match>}
 */
const getMatchById = (matchId) => {
  return new Promise((resolve, reject) => {
    const match = matchesCache.get(matchId);
    if (match) { // the match is on the cache
      match.fromCache = true;
      resolve(match);
    } else { // fetch from who let the dogs out
      wltdoFacade.getMatchById(matchId).then(match => {
        matchesCache.put(match._id, match, EIGHT_HOURS_IN_MS);
        resolve(match);
      }).catch(reject);
    }
  });
};

/**
 * Get a list of matches based on the passed time interval.
 *
 * @param startDate
 * @param endDate
 *
 * @returns {Promise<[Match]>}
 */
const getMatchesByTimeInterval = (startDate, endDate) => {
  const key = startDate + endDate;
  return new Promise((resolve, reject) => {
    const matches = matchesCache.get(key);
    if (matches) {
        resolve(matches);
    } else {
      wltdoFacade.getMatchesOnInterval(startDate, endDate).then(matches => {
        matchesCache.put(key, matches, ONE_DAY_IN_MS);
        resolve(matches);
      }).catch(reject);
    }
  });
};

module.exports = {getMatchById, getMatchesByTimeInterval};
