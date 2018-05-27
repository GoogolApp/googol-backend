const Joi = require('joi');

module.exports = {
  // POST /api/owner
  createOwner: {
    body: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  }, 

  // POST /:ownerId/myBar
  setMyBar: {
    body: {
      placeId: Joi.required()
    },
    params: {
      ownerId: Joi.string().hex().required()
    }
  }
}