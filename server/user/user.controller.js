const User = require('./user.model');
const teamService = require('../team/team.service');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');

const ADD = "add";
const REMOVE = "remove";

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
 *
 * @property {string} req.body.favTeams - Arrays of id`s of Teams
 *
 * @returns {User}
 */
function updateFavTeams(req, res, next) {
  const user = req.queryUser;
  const teamsFromRequest = req.body.favTeams;

  user.favTeams = teamsFromRequest;

  user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Update the following of the User. This can be an add or remove operation.
 *
 * @property {string} req.body.operation - The operation that can be add or remove .
 * @property {string} req.body.user - The id of the User to be followed.
 * @property {string} req.body.queryUser - The User document that will follow.
 */
function updateFollowing (req, res, next) {
  const user = req.queryUser;
  const userToBeFollowedOrUnfollowedId = req.body.user;
  const operation = req.body.operation;

  if (operation === ADD) {
    _follow(user, userToBeFollowedOrUnfollowedId)
      .then(user => res.json(user))
      .catch(err => next(new APIError(ErrorMessages.ERROR_ON_FOLLOW_USER, httpStatus.BAD_REQUEST, true)));
  } else {
    _unfollow(user, userToBeFollowedOrUnfollowedId)
      .then(user => res.json(user))
      .catch(err => next(new APIError(ErrorMessages.ERROR_ON_UNFOLLOW_USER, httpStatus.BAD_REQUEST, true)));  }
}

/**
 * Add a user to the queryUser following list and vice versa.
 *
 * @param user - User document of the user that will follow.
 * @param userToBeFollowedId - Id of the User that will be followed.
 * @private
 */
function _follow (user, userToBeFollowedId) {
  return User.followUser(user, userToBeFollowedId).then(() => {
    return User.get(user._id);
  });
}

/**
 * Remove a user to the queryUser following list and vice versa.
 *
 * @param user - User document of the user that will unfollow.
 * @param userToBeUnfollowedId - Id of the User that will be unfollowed.
 * @private
 */
function _unfollow (user, userToBeUnfollowedId) {
  return User.unfollowUser(user, userToBeUnfollowedId).then(() => {
    return User.get(user._id);
  });
}

module.exports = {load, get, create, update, list, remove, updateFavTeams, search, updateFollowing};
