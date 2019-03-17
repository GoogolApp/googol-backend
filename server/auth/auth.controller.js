const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');
const config = require('../../config/config');

const mailService = require('../helpers/mail.service');

const User = require('../user/user.model');
const Owner = require('../owner/owner.model');

const USER_ROLE = 'user';
const OWNER_ROLE = 'owner';

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
        email: user.email,
        role: USER_ROLE
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
  if (String(req.user._id) === String(req.queryUser._id)) {
    next();
  } else {
    const err = new APIError(ErrorMessages.FORBIDDEN_DEFAULT, httpStatus.FORBIDDEN, true);
    next(err);
  }
};

/**
 * Checks if the loged owners has the permission for set the bar information.
 */
const checkBarOwner = async (req, res, next) => {
  const ownerId = req.user._id;
  req.user = await Owner.get(ownerId);
  if (String(req.user.bar._id) === String(req.queryBar._id)) {
    next();
  } else {
    const err = new APIError(ErrorMessages.FORBIDDEN_DEFAULT, httpStatus.FORBIDDEN, true);
    next(err);
  }
};


//OWNER AUTH

/**
 * Returns jwt token if valid email and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const ownerLogin = (req, res, next) => {
  const ownerEmail = req.body.email;
  const ownerPassword = req.body.password;

  Owner.getByEmail(ownerEmail).then((owner) => {
    if (owner && ownerEmail === owner.email && owner.comparePassword(ownerPassword, owner.password)) {
      const token = jwt.sign({
        _id: owner._id,
        email: owner.email,
        role: OWNER_ROLE
      }, config.jwtSecret);
      return res.json({
        token,
        ownerId: owner._id
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

const checkOwner = (req, res, next) => {
  if (String(req.user._id) === String(req.queryOwner._id)) {
    next();
  } else {
    const err = new APIError(ErrorMessages.FORBIDDEN_DEFAULT, httpStatus.FORBIDDEN, true);
    next(err);
  }
};

const sendRecoveryPasswordMail = async (req, res, next) => {
  const userEmail = req.body.email;
  try {
    const user = await User.getByEmail(userEmail);

    if (user && userEmail === user.email) {
      const token = jwt.sign({
        _id: user._id,
        action: 'password_recovery',
        time: new Date()
      }, config.jwtSecret);

      await mailService.sendPasswordRecoveryEmail(user.username, user.email, token);
      
      return res.json({
        message: 'An recovery password email was send'
      });
    } else {
      const err = new APIError(ErrorMessages.USER_NOT_FOUND, httpStatus.BAD_REQUEST, true);
      return next(err);
    }
  } catch (error) {
    const err = new APIError(error, httpStatus.INTERNAL_SERVER_ERROR);
    return next(err);
  };
};

const changePassword = async (req, res, next) => {
  //TODO: this have to be validate, maybe in the middleware??
  const user = req.queryUser;
  const { password } = req.body;
  user.password = password;
  try {
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (e) {
    next(e);
  }
};

module.exports = { login, checkUser, ownerLogin, checkOwner, checkBarOwner };
