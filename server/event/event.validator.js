const Joi = require('joi');


const objectIdJoiValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/, "mongoDB object id");


module.exports = {
  //POST /api/event
  createEvent: {
    body: {
      matchId: objectIdJoiValidator.required(),
      barId: objectIdJoiValidator.required()
    }
  },
  
  //GET /api/event
  getById:{
    params: {
      eventId: objectIdJoiValidator.required()
    }
  },
  // GET /api/event
  geoList:{
    body: {
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      maxDistance: Joi.number()
    }
  }
  
};
