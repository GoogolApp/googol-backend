const Joi = require('joi');

module.exports = {
  // POST /api/auth/login
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  },
  passwordRecovery: {
    body: {
      email: Joi.string().required()
    }
  },
  passwordChange: {
    body: {
      password: Joi.string().required()
    }
  }
};
