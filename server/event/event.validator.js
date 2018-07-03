const Joi = require('joi');


const objectIdJoiValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/, "mongoDB object id");


module.exports = {
  // POST /api/owner
  createEvent: {
    body: {
      matchId: objectIdJoiValidator.required(),
      barId: objectIdJoiValidator.required()
    }
  },
  
  getById:{
    params: {
      eventId: objectIdJoiValidator.required()
    }
  },

  geoList:{
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    maxDistance: Joi.number()
    
  }
  
};
