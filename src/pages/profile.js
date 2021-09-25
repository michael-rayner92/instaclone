import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { getUserByUsername } from '../services/firebase';
import * as ROUTES from '../constants/routes';
import Header from '../components/header';
import UserProfile from '../components/profile';

export default function Profile() {
  const history = useHistory();
  const { username } = useParams();
  const [user, setUser] = useState([]);

  useEffect(() => {
    async function checkUserExists() {
      const [user] = await getUserByUsername(username);

      if (user?.userId) setUser(user);
      else history.push(ROUTES.NOT_FOUND);
    }

    checkUserExists();
  }, [username, history]);

  return user?.username ? (
    <div className="bg-gray-background">
      <Header />
      <div className="mx-auto max-w-screen-lg">
        <UserProfile user={user} />
      </div>
    </div>
  ) : null;
}
