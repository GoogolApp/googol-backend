const Joi = require('joi');
const ObjectId = require('mongoose').Types.ObjectId;
const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');
const httpStatus = require('http-status');


const ADD = "add";
const REMOVE = "remove";

const objectIdJoiValidatior = Joi.string().regex(/^[0-9a-fA-F]{24}$/, "mongoDB object id").required();

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
    body: {
      username: Joi.string().required(),
      email: Joi.string().email().required()/* ,
      mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/).required()*/
    },
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

  // PATCH /api/users/:userId/followingBar
  updateFollowingBar: {
    body: {
      operation: Joi.string().valid(ADD, REMOVE).required(),
      barId: objectIdJoiValidatior
    },
    params: {
      userId: objectIdJoiValidatior
    }
  },

  validateFavTeams: (req, res, next) => {
    const favTeams = req.body.favTeams;

    const favTeamsWithoutDuplicates = [];
    const validMap = {};

    favTeams.forEach((teamId) => {
      validMap[teamId] = ObjectId.isValid(teamId);
    });

    for (const key in validMap) {
      if (!validMap[key]) {
        return next(new APIError(ErrorMessages.INVALID_TEAM_ID + `: [${key}]`, httpStatus.BAD_REQUEST, true));
      }
      favTeamsWithoutDuplicates.push(key);
    }

    req.body.favTeams = favTeamsWithoutDuplicates;
    next();
  }

};
