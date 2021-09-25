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
 * Query firestore for a user by username
 * @async
 * @param {string} username
 * @returns user data or false if not found
 */
export async function getUserByUsername(username) {
  const result = await firebase
    .firestore()
    .collection('users')
    .where('username', '==', username)
    .get();

  return result.docs.map(item => ({
    ...item.data(),
    docId: item.id
  }));
}

/**
 * Query firestore to get a user's photos by username
 * @async
 * @param {string} username
 * @returns Array  of user's photos
 */
export async function getUserPhotosByUsername(username) {
  const [user] = await getUserByUsername(username);
  const result = await firebase
    .firestore()
    .collection('photos')
    .where('userId', '==', user.userId)
    .get();

  return result.docs.map(item => ({
    ...item.data(),
    docId: item.id
  }));
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

/**
 * Query firestore to see if logged in user is following a given profile
 * @async
 * @param {string} loggedInUserUsername username to check is a follower
 * @param {string} profileUserId profile userId of queried profile
 * @return Boolean value of logged in user's following status
 */
export async function isUserFollowingProfile(loggedInUserUsername, profileUserId) {
  const result = await firebase
    .firestore()
    .collection('users')
    .where('username', '==', loggedInUserUsername)
    .where('following', 'array-contains', profileUserId)
    .get();

  const [response = {}] = result.docs.map(item => ({
    ...item.data(),
    docId: item.id
  }));

  return !!response.userId;
}

/**
 * Follow or unfollow an account
 * @async
 * @param {string} isFollowingProfile Profile to follow/unfollow's doc id
 * @param {string} activeUserDocId Logged in user's doc id
 * @param {string} profileDocId Logged in user's user id
 * @param {string} profileUserId User id of the profile to be followed/unfollowed
 * @param {string} followingUserId Current following state
 */
export async function toggleFollow(
  isFollowingProfile,
  activeUserDocId,
  profileDocId,
  profileUserId,
  followingUserId
) {
  await updateLoggedInUserFollowing(activeUserDocId, profileUserId, isFollowingProfile);
  await updateFollowedUserFollowers(profileDocId, followingUserId, isFollowingProfile);
}
