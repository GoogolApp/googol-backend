const User = require('../user/user.model');
const reputatioConstants = require('../reputation/reputation.constants');


/**
 * Add reputation for the creator of an Event
 * @param userId
 * @returns {number} increment
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

/**
 * Add reputation for the creator of an Event when the event has a new attendant,
 * Add reputation to the new attendant also.
 * @param userIdCreator
 * @param userIdAttendant
 * @returns {number} increment
 */
async function reputationNewAttendant(userIdCreator, userIdAttendant){
  try {
    //LOAD OBJETS
    const attendant = await User.get(userIdAttendant);
    
    //REPUTATION TO ATTENDANT
    let increment = Math.min(reputatioConstants.INCREMENT_ATTEND, reputatioConstants.REPUTATION_DAILY_QUOTA - attendant.dailyReputation);
    increment = Math.max(increment, 0);
    await attendant.directReputationAddition(increment);
    await attendant.dailyReputationAddition(increment);
    
    //REPUTATION TO CREATOR
    if(userIdCreator != undefined){
      const creator = await User.get(userIdCreator);
      await creator.directReputationAddition(reputatioConstants.INCREMENT_NEW_ATTEND);
    }

    return increment;
  }catch (err) {
    throw(err);
  }
}

/**
 * Remove reputation for the attendant of an Event
 * @param userIdCreator
 * @param userIdAttendant
 */
async function reputationRemoveAttendant(userIdCreator, userIdAttendant){
  try {
    //LOAD OBJETS
    const attendant = await User.get(userIdAttendant);
    
    //REPUTATION TO ATTENDANT
    let decrement = reputatioConstants.DECREMENT_ATTEND;
    await attendant.directReputationAddition(decrement);
    await attendant.dailyReputationAddition(decrement);

    //REPUTATION TO CREATOR
    if(userIdCreator != undefined){
      const creator = await User.get(userIdCreator);
      await creator.directReputationAddition(reputatioConstants.DECREMENT_NEW_ATTEND);
    }

    return decrement;
  }catch (err) {
    throw(err);
  }
}

/**
 * Adds reputation for the creator of an Event if the owner confirm.
 * @param userIdCreator
 */
async function reputationOwnerConfirm(userIdCreator){
  try {
    //REPUTATION TO CREATOR
    if(userIdCreator != undefined){
      const creator = await User.get(userIdCreator);
      await creator.directReputationAddition(reputatioConstants.INCREMENT_CONFIRMED_BY_USER);
    }
  }catch (err) {
    throw(err);
  }
}

/**
 * Remove reputation for the creator of an Event if the owner unconfirm
 * @param userIdCreator
 */
async function reputationOwnerUnconfirm(userIdCreator){
  try {
    //DECREASE REPUTATION TO CREATOR
    if(userIdCreator != undefined){
      const creator = await User.get(userIdCreator);
      await creator.directReputationAddition(reputatioConstants.DECREMENT_OWNER_UNCONFIRM);
    }
  }catch (err) {
    throw(err);
  }
}

module.exports = {reputationCreateEvent, reputationNewAttendant, reputationRemoveAttendant, reputationOwnerConfirm};