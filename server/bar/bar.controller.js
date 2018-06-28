const Bar = require('./bar.model');
const DateUtils = require('../helpers/DateUtils');

/**
 * Load bar and append to req.
 */
function load(req, res, next, id) {
  Bar.get(id)
    .then((bar) => {
      req.queryBar= bar; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Update the bar promo
 *
 * @property {string} req.body.promo - The new promo value.
 */
async function updateBarPromo(req, res, next) {
  const bar = req.queryBar;
  const promo = req.body.promo;
  bar.promo = {};
  bar.promo.content = promo;
  const createdAt = DateUtils.convertToBrazilTimezone(new Date());
  bar.promo.createdAt = createdAt;
  try {
    const savedBar = await bar.save();
    res.json(savedBar);
  } catch (err) {
    next(err);
  }
}

/**
 * Get bar
 * @returns {Bar}
 */
function get(req, res) {
  return res.json(req.queryBar);
}

/**
 * Search bars
 * @property {string} req.query.keyword - Keyword to be searched for in name of bars.
 * @property {number} req.query.latitude - Latitude of the point of the center of the search
 * @property {number} req.query.longitude -  Longitude of the point of the center of the search
 * @property {number} req.query.maxDistance - Radius from the point of the center of the search in kilometers
 * @returns [{Bar}]
 */
function geoSearch(req, res, next) {
  Bar.geolocationSearch(req.query.keyword, req.query.latitude, req.query.longitude, req.query.maxDistance)
    .then((bars) => {
      return res.json(bars);
    })
    .catch(e => next(e));
}

/**
 * Search bars
 * @property {string} req.query.keyword - Keyword to be searched for in name of bars.
 * @returns [{Bar}]
 */
function search(req, res, next) {
  Bar.search(req.query.keyword)
    .then((bars) => {
      return res.json(bars);
    })
    .catch(e => next(e));
}

/**
 * Create new bar
 * @property {string} req.body.name - The name of bar.
 * @property {string} req.body.placeId - The placeId of bar.
 * @property {number} req.body.latitude - The latitude of bar. *
 * @property {number} req.body.longitude - The longitude of bar. *
 *
 * @returns {Bar}
 */
function create(req, res, next) {
  saveBar(req.body)
  .then(savedBar => res.json(savedBar))
  .catch(e => next(e))

}

/**
 * Save a new bar to the data base
 * @property {string} name - The name of bar.
 * @property {string} placeId - The placeId of bar.
 * @property {number} latitude - The latitude of bar. *
 * @property {number} longitude - The longitude of bar. *
 *
 * @returns {Bar}
 */
function saveBar(bar){
  bar.location = {
    type: "Point",
      coordinates: [bar.longitude, bar.latitude]
  };
  const createdBar = new Bar(bar);
  return createdBar.save();
}

/**
 * Get bar list.
 * @property {number} req.query.skip - Number of bars to be skipped.
 * @property {number} req.query.limit - Limit number of bars to be returned.
 * @returns {Bar[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Bar.list({ limit, skip })
    .then(bars => res.json(bars))
    .catch(e => next(e));
}

/**
 * Delete bar.
 * @returns {Bar}
 */
function remove(req, res, next) {
  const bar = req.queryBar;
  bar.remove()
    .then(deletedBar => res.json(deletedBar))
    .catch(e => next(e));
}


module.exports = { load, get, create, list, remove, geoSearch, search, saveBar, updateBarPromo};
