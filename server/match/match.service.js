const cache = require('memory-cache');
const wltdoFacade = require('../helpers/whoLetTheDogsOut.facade');

const matchesCache = new cache.Cache();

const getMatch = (matchId) => {
  return new Promise((resolve, reject) => {
    const match = matchesCache.get(matchId);
    if (match) { // the match is on the cache
      resolve(match);
    } else { // fetch from who let the dogs out
      wltdoFacade.getMatchById(matchId).then(match => {
        matchesCache.put(match._id, match);
        resolve(match);
      }).catch(reject);
    }
  });
};
