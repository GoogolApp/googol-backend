const Team = require('./team.model');


/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {Team[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Team.list({ limit, skip })
        .then(teams => res.json(teams))
        .catch(e => next(e));
}


module.exports = { list };
