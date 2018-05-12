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

/**
 * Create new team
 * @property {string} req.body.name - The name of team.
 * @property {string} req.body.imgSource - The source of team Image.
 * @returns {Team}
 */
function create(req, res, next) {
  const team = new Team({
    name: req.body.name,
    imgSource: req.body.imgSource,
  });

  team.save()
    .then(savedTeam => res.json(savedTeam))
    .catch(e => next(e));
}


module.exports = { list, create };
