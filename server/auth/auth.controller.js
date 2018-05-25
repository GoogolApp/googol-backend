const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');
const config = require('../../config/config');

const User = require('../user/user.model');

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const login = (req, res, next) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  User.getByEmail(userEmail).then((user) => {
    if (user && userEmail === user.email && user.comparePassword(userPassword, user.password)) {
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
      const err = new APIError(ErrorMessages.INVALID_EMAIL_OR_PASSWORD, httpStatus.UNAUTHORIZED, true);
      return next(err);
    }
  }).catch((error) => {
    const err = new APIError(error, httpStatus.BAD_REQUEST);
    return next(err);
  });
};

const checkUser = (req, res, next) => {
  if(String(req.user._id) === String(req.queryUser._id)) {
    next();
  } else {
    const err = new APIError(ErrorMessages.FORBIDDEN_DEFAULT, httpStatus.FORBIDDEN, true);
    next(err);
  }
};

module.exports = {login, checkUser};
