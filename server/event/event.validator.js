const Joi = require('joi');


const objectIdJoiValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/, "mongoDB object id");

const CONFIRM = "confirm";
const UNCONFIRM = "unconfirm";
const CONFIRM_BY_OWNER = "confirmedByOwner";
const UNCONFIRM_BY_OWNER = "unconfirmedByOwner";

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
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    maxDistance: Joi.number()
    
  },

  // PATCH /api/events/:eventid
  confirmUnconfirm:{
    params: {
      eventId: objectIdJoiValidator.required()
    },
    body: {
      operation: Joi.string().valid(CONFIRM, UNCONFIRM, CONFIRM_BY_OWNER, UNCONFIRM_BY_OWNER).required()
    }
  },

  //DELETE /api/events/:eventId
  deleteEvent:{
    params: {
      eventId: objectIdJoiValidator.required()
    }
  },

  //GET /api/events/:eventid/createdBy
  getCreateBy:{
    params: {
      userId: objectIdJoiValidator.required()
    }
  },

  // GET /api/events/followingUsers/:userId
  getFollowingUsers:{
    params: {
      userId: objectIdJoiValidator.required()
    }
  },

  // GET /api/events/followingBars/:userId 
  getFollowingBars:{
    params: {
      userId: objectIdJoiValidator.required()
    }
  },

  // GET /api/events/feed/:userId
  getFollowingFeed:{
    params: {
      userId: objectIdJoiValidator.required()
    }
  }
  
};
