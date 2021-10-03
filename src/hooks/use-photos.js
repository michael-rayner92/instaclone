import { useEffect, useState } from 'react';
import { getPhotos } from '../services/firebase';

export default function usePhotos(user) {
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    async function getTimelinePhotos() {
      let followedUserPhotos = [];

      if (user?.following?.length > 0) {
        followedUserPhotos = await getPhotos(user.userId, user.following);
      }

      followedUserPhotos.sort((a, b) => b.dateCreated - a.dateCreated);
      setPhotos(followedUserPhotos);
    }

    getTimelinePhotos();
  }, [user]);

  return { photos };
}
