const cache = require('memory-cache');
const wltdoFacade = require('../helpers/whoLetTheDogsOut.facade');

const EIGHT_HOURS_IN_MS = 1000 * 60 * 60 * 8;
const ALL_TEAMS_KEY = "allTeamsKey";

const teamsCache = new cache.Cache();

/**
 * Get a team by id.
 *
 * @param teamId
 *
 * @returns {Promise<Team>}
 */
const getTeamById = teamId => {
  return new Promise((resolve, reject) => {
    const team = teamsCache.get(teamId);
    if (team) {
      team.fromCache = true;
      resolve(team);
    } else {
      wltdoFacade.getTeamById(teamId).then((team) => {
        teamsCache.put(team._id, team, EIGHT_HOURS_IN_MS);
        resolve(team);
      }).catch(reject);
    }
  });
};

/**
 * Get all teams.
 *
 * @returns {Promise<[Team]>}
 */
const getAllTeams = () => {
  return new Promise((resolve, reject) => {
    const teams = teamsCache.get(ALL_TEAMS_KEY);
    if (teams) {
      resolve(teams);
    } else {
      wltdoFacade.getAllTeams().then(teams => {
        teams.forEach((team) => {
          teamsCache.put(team._id, team, EIGHT_HOURS_IN_MS);
        });
        teamsCache.put(ALL_TEAMS_KEY, teams, EIGHT_HOURS_IN_MS);
        resolve(teams);
      }).catch(reject);
    }
  });
};

/**
 * Recive an array of Teams id and populate it.
 *
 * @param teamIdArray
 *
 * @returns {Promise<[Team]>}
 */
const populateTeams = teamIdArray => {
  const teams = [];
  const promises = [];
  teamIdArray.forEach(teamId => {
    const promise = getTeamById(teamId).then(team => teams.push(team));
    promises.push(promise);
  });

  return Promise.all(promises).then(() => {
    return teams;
  });
};

module.exports = {getTeamById, getAllTeams, populateTeams};
