const Owner = require('./owner.model');
const Bar = require('../bar/bar.model');

const barCtrl = require('../bar/bar.controller');

const APIError = require('../helpers/APIError');
const ErrorMessages = require('../helpers/ErrorMessages');
const httpStatus = require('http-status');

/**
 * Load owner and append to req.
 */
function load(req, res, next, id) {
  Owner.get(id)
    .then((owner) => {
      req.queryOwner = owner; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}


/**
 * Get owner
 * @returns {Owner}
 */
function get(req, res) {
  return res.json(req.queryOwner);
}

/**
 * Create new owner
 * @property {string} req.body.email - The email of owner.
 * @property {string} req.body.password - The password of owner.
 * @returns {Owner}
 */
function create(req, res, next) {
  const owner = new Owner({
    email: req.body.email,
    password: req.body.password
  });

  owner.save()
    .then(savedOwner => res.json(savedOwner))
    .catch(e => next(e));
}

/**
 * An owner can claim a bar
 * @property {string} req.body.placeID - The placeId of the bar.
 * @returns {Owner}
 */
function setMyBar(req, res, next) {
  const owner = req.queryOwner;
  Bar.findOne({
    placeId: req.body.placeId
  })
    .then((bar) => {
      if(bar){
        owner.bar = bar;
        return owner;
      }else{
        return barCtrl.saveBar(req.body.name, req.body.placeId, req.body.longitude, req.body.latitude)
        .then((savedBar) => {
          owner.bar = savedBar;
          return owner;
        })
        .catch(e => {
          const err = new APIError(ErrorMessages.ERROR_CREATE_BAR, httpStatus.BAD_REQUEST);
          return Promise.reject(err);
        })
      }
    }).then(() => {
      owner.save()
        .then(savedOwner => res.json(savedOwner))
        .catch(e => next(e));
    })
    .catch(e => next(e));
}

/**
 * Get owner list.
 * @property {number} req.query.skip - Number of owners to be skipped.
 * @property {number} req.query.limit - Limit number of owners to be returned.
 * @returns {Owner[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Owner.list({ limit, skip })
    .then(owners => res.json(owners))
    .catch(e => next(e));
}

/**
 * Delete owner.
 * @returns {Owner}
 */
function remove(req, res, next) {
  const owner = req.queryOwner;
  owner.remove()
    .then(deletedOwner => res.json(deletedOwner))
    .catch(e => next(e));
}

module.exports = { load, get, create, setMyBar, remove, list};