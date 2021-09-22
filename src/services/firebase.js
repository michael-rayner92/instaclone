/**
 * Firestore Service
 * @module /src/services/firestore.js
 * @author Michael Rayner <michael@genspeakapp.com>
 * @version 0.1.0
 * @description Service layer for interacting with firestore
 *
 * See [Using Firestore]{@tutorial firebase} to see all available functions
 */

import { firebase, FieldValue } from '../lib/firebase';

/**
 * Check firestore is username is already used
 * @async
 * @param {string} username firebase username
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
 * @async
 * @param {string} userId firestore user.uid
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
 * @async
 * @param {string} userId firestore user.uid
 * @param {string[]} following list of profiles currently being followed
 */
export async function getSuggestedProfiles(userId, following) {
  const result = await firebase.firestore().collection('users').limit(10).get();

  return result.docs
    .map(user => ({ ...user.data(), docId: user.id }))
    .filter(profile => profile.userId !== userId && !following.includes(profile.userId));
}

/**
 * Add or remove a profile from current users following list
 * @async
 * @param {string} loggedInUserDocId currently logged in user document id
 * @param {string} profileId the user requested to be followed
 * @param {boolean} isFollowingProfile true if the user currently being followed
 */
export async function updateLoggedInUserFollowing(
  loggedInUserDocId,
  profileId,
  isFollowingProfile
) {
  return firebase
    .firestore()
    .collection('users')
    .doc(loggedInUserDocId)
    .update({
      following: isFollowingProfile
        ? FieldValue.arrayRemove(profileId)
        : FieldValue.arrayUnion(profileId)
    });
}

/**
 * Add or remove a follower from an account
 * @async
 * @param {string} profileDocId suggested profile id
 * @param {string} loggedInUserDocId currently logged in user id
 * @param {boolean} isFollowingProfile true if the user currently being followed
 */
export async function updateFollowedUserFollowers(
  profileDocId,
  loggedInUserDocId,
  isFollowingProfile
) {
  return firebase
    .firestore()
    .collection('users')
    .doc(profileDocId)
    .update({
      followers: isFollowingProfile
        ? FieldValue.arrayRemove(loggedInUserDocId)
        : FieldValue.arrayUnion(loggedInUserDocId)
    });
}

/**
 * Get photos from logged in user's followed accounts
 * @async
 * @param {string} userId firestore user.uid
 * @param {string[]} following array of followed user ids
 */
export async function getPhotos(userId, following) {
  const result = await firebase
    .firestore()
    .collection('photos')
    .where('userId', 'in', following)
    .get();

  const userFollowedPhotos = result.docs.map(photo => ({
    ...photo.data(),
    docId: photo.id
  }));

  const photosWithUserDetails = await Promise.all(
    userFollowedPhotos.map(async photo => {
      const userLikedPhoto = photo.likes.includes(userId);
      const user = await getUserByUserId(photo.userId);

      const { username } = user[0];
      return { username, ...photo, userLikedPhoto };
    })
  );

  return photosWithUserDetails;
}
