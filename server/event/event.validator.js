const Joi = require('joi');


const objectIdJoiValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/, "mongoDB object id");

const CONFIRM = "confirm";
const UNCONFIRM = "unconfirm";


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
    body: {
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      maxDistance: Joi.number()
    }
  },

  confirmEvent:{
    body: {
      operation: Joi.string().valid(CONFIRM, UNCONFIRM).required()
    },
    params: {
      eventId: objectIdJoiValidator.required()
    }
  },

  deleteEvent:{
    params: {
      eventId: objectIdJoiValidator.required()
    }
  },
  
};
