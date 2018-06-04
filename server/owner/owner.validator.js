const Joi = require('joi');

module.exports = {
  // POST /api/owner
  createOwner: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  }, 

  // POST /:ownerId/myBar
  setMyBar: {
    body: {
      name: Joi.string(),
      placeId: Joi.string().required(),
      latitude: Joi.number(),
      longitude: Joi.number()
    },
    params: {
      ownerId: Joi.string().hex().required()
    }
  }
}