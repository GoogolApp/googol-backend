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
      name: Joi.string().required(),
      placeId: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      address: Joi.string().required(),
      phone: Joi.string().regex(/^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/)
    },
    params: {
      ownerId: Joi.string().hex().required()
    }
  }
};
