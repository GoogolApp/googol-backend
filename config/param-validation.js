const Joi = require('joi');

module.exports = {
  // POST /api/users
  createUser: {
    body: {
      username: Joi.string().required(),
      email: Joi.string().email().required()/* ,
      mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/).required()*/
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

  // POST /api/auth/login
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // POST /api/users/:userId/favTeams
  updateFavTeams: {
    body: {
      favTeams: Joi.array()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },


};
