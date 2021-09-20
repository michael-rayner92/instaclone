import { firebase } from '../lib/firebase';

/**
 * Check firestore is username is already used
 */
export async function doesUsernameExist(username) {
  const result = await firebase
    .firestore()
    .collection('users')
    .where('username', '==', username)
    .get();

  return !!result.docs.map(user => user.data().length > 0).length;
}

/**
 * Get user from the firestore where userId === userId (passed from the auth context)
 */
export async function getUserByUserId(userId) {
  const result = await firebase.firestore().collection('users').where('userId', '==', userId).get();

  const user = result.docs.map(item => ({
    ...item.data(),
    docId: item.id
  }));

  return user;
}

/**
 * Get suggested profiles from firestore
 * Filters out current user and already followed profiles
 */
export async function getSuggestedProfiles(userId, following) {
  const result = await firebase.firestore().collection('users').limit(10).get();

  return result.docs
    .map(user => ({ ...user.data(), docId: user.id }))
    .filter(profile => profile.userId !== userId && !following.includes(profile.userId));
}
