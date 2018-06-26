const Joi = require('joi');

module.exports = {
  // POST /api/bar
  createBar: {
    body: {
      name: Joi.string().required(),
      placeId: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      maxDistance: Joi.number()
    }
  }


}