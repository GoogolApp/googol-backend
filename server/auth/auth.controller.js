const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const config = require('../../config/config');

const User = require('../user/user.model');

// sample user, used for authentication
const user = {
  username: 'react',
  password: 'express'
};

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  User.getByEmail(userEmail).then((user) => {
    if (userEmail === user.email && userPassword === user.password) {
      const token = jwt.sign({
        username: user.username
      }, config.jwtSecret);
      return res.json({
        token,
        userId: user._id
      });
    } else {
      const err = new APIError('Invalid email or password', httpStatus.UNAUTHORIZED, true);
      return next(err);
    }
  }).catch(() => {
    const err = new APIError('No users with this email found', httpStatus.NOT_FOUND, true);
    return next(err);
  });
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

module.exports = { login, getRandomNumber };
