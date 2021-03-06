const express = require('express');

const validate = require('express-validation');
const paramValidation = require('./user.validator');

const userCtrl = require('./user.controller');
const authCtrl = require('../auth/auth.controller');

const expressJwt = require('express-jwt');
const config = require('../../config/config');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/users - Get list of users */
  .get(userCtrl.list)

  /** POST /api/users - Create new user */
  .post(validate(paramValidation.createUser), userCtrl.create);

router.route('/search')
  /** GET /api/users/search - Get list of users */
  .get(userCtrl.search)

router.route('/:userId')
  /** GET /api/users/:userId - Get user */
  .get(userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put([validate(paramValidation.updateUser), expressJwt({ secret: config.jwtSecret }), authCtrl.checkUser], userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete([expressJwt({ secret: config.jwtSecret }), authCtrl.checkUser], userCtrl.remove);

router.route('/:userId/favTeam')
  /** PATCH /api/users/:userId/favTeam - Add or Remove a favTeam */
  .patch([validate(paramValidation.patchFavTeams), paramValidation.validateFavTeam, expressJwt({ secret: config.jwtSecret }), authCtrl.checkUser], userCtrl.updateFavTeams)

router.route('/:userId/following')
  .patch([validate(paramValidation.updateFollowing), expressJwt({ secret: config.jwtSecret }), authCtrl.checkUser], userCtrl.updateFollowing)

  /** GET /api/users/:userId/following - Get user following users */
  .get(userCtrl.getFollowing)

router.route('/:userId/followers')
  /** GET /api/users/:userId/following - Get user followers */
  .get(userCtrl.getFollowers)

router.route('/:userId/followingBars')
  .patch([validate(paramValidation.updateFollowingBar), expressJwt({ secret: config.jwtSecret }), authCtrl.checkUser], userCtrl.updateFollowingBars)

  .get(userCtrl.getFollowingBars);

router.route('/:userId/followingBars/promo')
  .get([validate(paramValidation.getFollowingBarsPromo), expressJwt({ secret: config.jwtSecret })], userCtrl.getFollowingBarsPromo);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

module.exports = router;
