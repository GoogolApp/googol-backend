const User = require('./user.model');
const Team = require('../team/team.model');
/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.queryUser = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.queryUser);
}

/**
 * Search users
 * @returns [{User}]
 */
function search(req, res, next) {
  User.search(req.query.keyword)
    .then((users) => {
      return res.json(users);
    })
    .catch(e => next(e));
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.name - The name of user.
 * @returns {User}
 */
function create(req, res, next) {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.name - The name of user.
 * @returns {User}
 */
function update(req, res, next) {
  const user = req.queryUser;
  user.username = req.body.username;
  user.name = req.body.name;
  user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const user = req.queryUser;
  user.remove()
    .then(deletedUser => res.json(deletedUser))
    .catch(e => next(e));
}

/**
 * Update existing user fav team list
 * @property {string} req.body.favTeams - The username of user.
 * @returns {User}
 */
function updateFavTeams(req, res, next) {
  const user = req.queryUser;
  Team.find({ _id: { $in: req.body.favTeams } }).distinct('_id')
    .then((favTeamArr) => {
      user.favTeams = favTeamArr;
      return user;
    }).then(() => {
      user.save()
        .then(savedUser => res.json(savedUser))
        .catch(e => next(e));
    })
    .catch(e => next(e));
}

module.exports = { load, get, create, update, list, remove, updateFavTeams , search};
