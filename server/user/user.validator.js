const Joi = require('joi');
const ObjectId = require('mongoose').Types.ObjectId;
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');
const httpStatus = require('http-status');


const ADD = "add";
const REMOVE = "remove";

const objectIdJoiValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/, "mongoDB object id").required();

module.exports = {
  // POST /api/users
  createUser: {
    body: {
      username: Joi.string().required(),
      email: Joi.string().email().required() ,
      password: Joi.string().required()
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: Joi.object().keys({
      username: Joi.string(),
      password: Joi.string()})
    .or('username', 'password'),
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // PUT /api/users/:userId/favTeams
  updateFavTeams: {
    body: {
      favTeams: Joi.array()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // PATCH /api/users/:userId/following
  updateFollowing: {
    body: {
      operation: Joi.string().valid(ADD, REMOVE).required(),
      user: Joi.string().required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // PATCH /api/users/:userId/favTeam
  patchFavTeams: {
    body: {
      operation: Joi.string().valid(ADD, REMOVE).required(),
      favTeamId: Joi.string().required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // PATCH /api/users/:userId/followingBar
  updateFollowingBar: {
    body: {
      operation: Joi.string().valid(ADD, REMOVE).required(),
      barId: objectIdJoiValidator
    },
    params: {
      userId: objectIdJoiValidator
    }
  },

  validateFavTeam: (req, res, next) => {
    const favTeams = req.body.favTeamId;
    if (!ObjectId.isValid(favTeams)) {
      return next(new APIError(ErrorMessages.INVALID_TEAM_ID, httpStatus.BAD_REQUEST, true));
    } else {
      next();
    }
  }

};
