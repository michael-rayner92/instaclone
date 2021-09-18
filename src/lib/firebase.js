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

const firebase = Firebase.initializeApp(config);
const { FieldValue } = Firebase.firestore;

// ** Seed database (only run ONCE!)
// seedDatabase(firebase);

export { firebase, FieldValue };
