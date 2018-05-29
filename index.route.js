const express = require('express');
const userRoutes = require('./server/user/user.route');
const authRoutes = require('./server/auth/auth.route');
const teamRoutes = require('./server/team/team.route');
const barRoutes = require('./server/bar/bar.route');
const ownerRoutes = require('./server/owner/owner.route');
const matchRoutes = require('./server/match/match.route');

const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount auth routes at /team
router.use('/team', teamRoutes);

// mount auth routes at /auth
router.use('/bar', barRoutes);

// mount auth routes at /auth
router.use('/owner', ownerRoutes);

router.use('/matches', matchRoutes);

module.exports = router;
