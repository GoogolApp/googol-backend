const User = require('../user/user.model');
const reputatioConstants = require('../reputation/reputation.constants');


/**
 * Add reputation for the creator of an Event
 * @property {string} userId
 * @returns Number
 */
async function reputationCreateEvent(userId){
  try {
    const user = await User.get(userId);
    let increment = Math.min(reputatioConstants.INCREMENT_CREATE_EVENT, reputatioConstants.REPUTATION_DAILY_QUOTA - user.dailyReputation);
    increment = Math.max(increment, 0);
    await user.directReputationAddition(increment);
    await user.dailyReputationAddition(increment);
    return increment;
  }catch (err) {
    throw(err);
  }
}

module.exports = {reputationCreateEvent};