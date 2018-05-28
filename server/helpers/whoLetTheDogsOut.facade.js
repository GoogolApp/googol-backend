const request = require('request');
const config = require('../../config/config');

/*
const config = {};
config.whoLetTheDogsOutUrl = 'https://who-let-the-dogs-out.herokuapp.com';
*/

const MATCHES_RESOURCE = '/api/matches';
const TEAMS_RESOURCE = '/api/teams';

const _get = (url) => {
  return new Promise((resolve, reject) => {
    request.get(url, (err, response, body) => {
        if (err) return reject(err);
        resolve(JSON.parse(body));
      }
    );
  });
};

/**
 * Get a match by id from the Who let the dogs out.
 *
 * @param matchId
 *
 * @returns {Promise<Match>}
 */
const getMatchById = (matchId) => {
  return _get(config.whoLetTheDogsOutUrl + MATCHES_RESOURCE + `/${matchId}`)
};

/**
 * Get a list of matches that occur in the passed time interval from the Who let the dogs out.
 *
 * @param startDate
 * @param endDate
 *
 * @returns {Promise<[Match]>}
 */
const getMatchesOnInterval = (startDate, endDate) => {
    return _get(config.whoLetTheDogsOutUrl + MATCHES_RESOURCE + `?startDate=${startDate || ''}&endDate=${endDate || ''}`);
};

/**
 * Get a team by id from the Who let the dogs out.
 * @param teamId
 */
const getTeamById = (teamId) => {
  return _get(config.whoLetTheDogsOutUrl + TEAMS_RESOURCE + `/${teamId}`)
};

/**
 * Get all teams from the Who let the dogs out.
 */
const getAllTeams = () => {
  return _get(config.whoLetTheDogsOutUrl + TEAMS_RESOURCE);
};

module.exports = {getMatchById, getMatchesOnInterval, getTeamById, getAllTeams};
