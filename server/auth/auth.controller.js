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
    if (userEmail === user.email && user.comparePassword(userPassword, user.password)) {
      const token = jwt.sign({
        username: user.username,
        _id: user._id,
        email: user.email
      }, config.jwtSecret);
      return res.json({
        token,
        userId: user._id
      });
    } else {
      const err = new APIError('Invalid email or password', httpStatus.UNAUTHORIZED, true);
      return next(err);
    }
  }).catch((error) => {
    const err = new APIError(error, httpStatus.BAD_REQUEST);
    return next(err);
  });
}

function checkUser (req, res, next) {
  if(''+req.user._id === ''+req.queryUser._id) {
    next();
  } else {
    const err = new APIError('Hey! You can`t do this!', httpStatus.FORBIDDEN, true);
    next(err);
  }
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

module.exports = { login, getRandomNumber, checkUser };
