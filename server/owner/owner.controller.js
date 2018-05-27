const Owner = require('./owner.model');
const Bar = require('../bar/bar.model');



/**
 * Load owner and append to req.
 */
function load(req, res, next, id) {
  Owner.get(id)
    .then((owner) => {
      req.queryOwner= owner; // eslint-disable-line no-param-reassign
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

function setMyBar(req, res, next){
  const owner = req.queryOwner;
  Bar.findOne({
    placeId: req.placeId 
  })
  .then((bar) => {
    owner.bar = bar;
    return owner;
  }).then(() => {
    owner.save()
    .then(savedOwner => res.json(savedOwner))
    .catch(e => next(e));
  })
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

module.exports = { load, get, create, setMyBar, remove };