import { useEffect, useState } from 'react';
import { getUserByUserId } from '../services/firebase';

export default function useUser(userId) {
  const [activeUser, setActiveUser] = useState({});

  // Get user data from firestore by userId
  useEffect(() => {
    async function getUserObjByUserId() {
      const [user] = await getUserByUserId(userId);
      setActiveUser(user || {});
    }

    if (userId) getUserObjByUserId();
  }, [userId]);

  return { user: activeUser };
}
