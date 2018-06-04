const teamService = require('./team.service');

/**
 * Get all Teams.
 */
const list = (req, res, next) => {
  teamService.getAllTeams()
    .then(teams => res.json(teams))
    .catch(err => next(err));
};

module.exports = { list };
