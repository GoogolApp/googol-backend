const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

/**
 * Team Schema
 */
const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  imgSource: {
    type: String,
    required: true
  }

});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
TeamSchema.method({
});

/**
 * Statics
 */
TeamSchema.statics = {
  /**
   * Get Team
   * @param {ObjectId} id - The objectId of team.
   * @returns {Promise<Team, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((team) => {
        if (team) {
          return team;
        }
        const err = new APIError('No such team exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List teams in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of teams to be skipped.
   * @param {number} limit - Limit number of teams to be returned.
   * @returns {Promise<Team[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef Team
 */
module.exports = mongoose.model('Team', TeamSchema);
