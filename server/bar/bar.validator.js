const Joi = require('joi');

module.exports = {
  // POST /api/bar
  createBar: {
    body: {
      name: Joi.string().required(),
      placeId: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      address: Joi.string().required(),
      phone: Joi.string().regex(/^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/)
    }
  },

  // PATCH /api/bar/:barId/promo
  editPromo: {
    body: {
      promo: Joi.string().required()
    }
  }
};
