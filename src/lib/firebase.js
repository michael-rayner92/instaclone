import Firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { envs } from '../config';

const config = {
  apiKey: envs.apiKey,
  authDomain: envs.authDomain,
  projectId: envs.projectId,
  storageBucket: envs.storageBucket,
  messagingSenderId: envs.messagingSenderId,
  appId: envs.appId
};
// const config = {
//   apiKey: 'AIzaSyBiGdb5wpG5jmvc_zX0qco-si9wOf-ddkU',
//   authDomain: 'instaclone-73465.firebaseapp.com',
//   projectId: 'instaclone-73465',
//   storageBucket: 'instaclone-73465.appspot.com',
//   messagingSenderId: '568932962189',
//   appId: '1:568932962189:web:fe3780f8cd768c21b9f7c4'
// };

const firebase = Firebase.initializeApp(config);
const { FieldValue } = Firebase.firestore;

// Seed database (only run ONCE!)
// seedDatabase(firebase);

export { firebase, FieldValue };
