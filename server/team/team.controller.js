const teamService = require('./team.service');

/**
 * Get all Teams.
 */
const list = (req, res, next) => {
  teamService.getAllTeams()
    .then(teams => res.json(teams))
    .catch(err => next(err));
};

const getTeamById = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    const team = await teamService.getTeamById(teamId);
    res.json(team);
  } catch (err) {
    next(err);
  }
};

module.exports = {list, getTeamById};
