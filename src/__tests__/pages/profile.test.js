import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import Profile from '../../pages/profile';
import UserContext from '../../context/user';
import FirebaseContext from '../../context/firebase';
import {
  isUserFollowingProfile,
  getUserByUsername,
  getUserPhotosByUsername
} from '../../services/firebase';
import useUser from '../../hooks/use-user';
import userFixture from '../../fixtures/logged-in-user';
import profileThatIsFollowedByLoggedInUserFixture from '../../fixtures/profile-followed-by-logged-in-user';
import profileThatIsNotFollowedByLoggedInUserFixture from '../../fixtures/profile-not-followed-by-logged-in-user';
import photosFixture from '../../fixtures/profile-photos';
import * as ROUTES from '../../constants/routes';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ username: 'orwell' }),
  useHistory: () => ({ push: mockHistoryPush })
}));

jest.mock('../../services/firebase');
jest.mock('../../hooks/use-user');

const user = { uid: 'NvPY9M9MzFTARQ6M816YAzDJxZ72', displayName: 'karl' };

describe('<Profile />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the profile page with a user profile', async () => {
    getUserByUsername.mockResolvedValue([userFixture]);
    getUserPhotosByUsername.mockResolvedValue(photosFixture);
    useUser.mockReturnValue({ user: userFixture });

    const firebase = {
      auth: jest.fn(() => ({
        signOut: jest.fn().mockResolvedValue({})
      }))
    };

    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <UserContext.Provider value={{ user }}>
            <Profile />
          </UserContext.Provider>
        </FirebaseContext.Provider>
      </Router>
    );

    expect(await screen.findByAltText("karl's profile avatar")).toBeInTheDocument();

    expect(getUserByUsername).toHaveBeenCalled();
    expect(getUserByUsername).toHaveBeenCalledWith('orwell');
    expect(mockHistoryPush).not.toHaveBeenCalled();
    expect(screen.getByTitle('Sign Out')).toBeInTheDocument();
    expect(screen.getByText('karl')).toBeInTheDocument();
    expect(screen.getByText('Karl Hadwen')).toBeInTheDocument();

    const photosView = screen.getByText(/photos/i);
    expect(within(photosView).getByText(/5/i)).toBeInTheDocument();

    const followersView = screen.getByText(/followers/i);
    within(followersView).getByText(/3/i);

    const followingView = screen.getByText(/following/i);
    within(followingView).getByText(/1/i);

    // Sign the user out
    userEvent.click(screen.getByRole('button', { name: 'Sign Out' }));
    fireEvent.keyDown(screen.getByTitle('Sign Out'), { key: 'Enter' });
  });

  it('renders the profile page with a user profile with 1 follower', async () => {
    userFixture.followers = ['2']; // put followers to 1
    getUserByUsername.mockResolvedValue([userFixture]);
    getUserPhotosByUsername.mockResolvedValue(photosFixture);
    useUser.mockReturnValue({ user: userFixture, followers: ['2'] });

    const firebase = {
      auth: jest.fn(() => ({
        signOut: jest.fn(() => ({
          updateProfile: jest.fn().mockResolvedValue({})
        }))
      }))
    };

    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <UserContext.Provider value={{ user }}>
            <Profile />
          </UserContext.Provider>
        </FirebaseContext.Provider>
      </Router>
    );

    expect(await screen.findByRole('button', { name: /Sign Out/i })).toBeInTheDocument();

    expect(getUserByUsername).toHaveBeenCalled();
    expect(getUserByUsername).toHaveBeenCalledWith('orwell');
    expect(mockHistoryPush).not.toHaveBeenCalled();
  });

  it('renders the profile page with a user profile and logged in and follows a user', async () => {
    isUserFollowingProfile.mockResolvedValue(true);
    profileThatIsNotFollowedByLoggedInUserFixture.followers = []; // reset followers
    getUserByUsername.mockResolvedValue([profileThatIsNotFollowedByLoggedInUserFixture]);
    getUserPhotosByUsername.mockResolvedValue(photosFixture);
    useUser.mockReturnValue({ user: userFixture });

    const firebase = {
      auth: jest.fn(() => ({
        signOut: jest.fn(() => ({
          updateProfile: jest.fn().mockResolvedValue({})
        }))
      }))
    };

    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <UserContext.Provider value={{ user }}>
            <Profile />
          </UserContext.Provider>
        </FirebaseContext.Provider>
      </Router>
    );

    expect(await screen.findByAltText("karl's profile avatar")).toBeInTheDocument();

    expect(mockHistoryPush).not.toHaveBeenCalled();
    expect(getUserByUsername).toHaveBeenCalledTimes(2);
    expect(getUserByUsername).toHaveBeenNthCalledWith(1, 'orwell');
    expect(getUserByUsername).toHaveBeenNthCalledWith(2, 'orwell');
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
    expect(screen.getByText('orwell')).toBeInTheDocument();
    expect(screen.getByText(/George Orwell/i)).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('button', { name: /Follow/i }), { key: 'Enter' });
  });

  it('renders the profile page with a user profile and logged in and unfollows a user', async () => {
    isUserFollowingProfile.mockResolvedValue(true);
    getUserPhotosByUsername.mockResolvedValue(false); // falsy photos
    getUserByUsername.mockResolvedValue([profileThatIsFollowedByLoggedInUserFixture]);
    useUser.mockReturnValue({ user: userFixture });

    const firebase = {
      auth: jest.fn(() => ({
        signOut: jest.fn(() => ({
          updateProfile: jest.fn(() => Promise.resolve({}))
        }))
      }))
    };

    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <UserContext.Provider value={{ user }}>
            <Profile />
          </UserContext.Provider>
        </FirebaseContext.Provider>
      </Router>
    );

    expect(await screen.findByAltText("karl's profile avatar")).toBeInTheDocument();

    expect(mockHistoryPush).not.toHaveBeenCalled();
    expect(getUserByUsername).toHaveBeenCalled();
    expect(getUserByUsername).toHaveBeenCalledWith('orwell');

    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
    expect(screen.getByText('orwell')).toBeInTheDocument();
    expect(screen.getByText('George Orwell')).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /Unfollow/i }));
  });

  it('renders the profile page but there is no user so redirect happens', async () => {
    getUserByUsername.mockResolvedValue([]);
    getUserPhotosByUsername.mockResolvedValue([]);
    useUser.mockReturnValue({ user: null });

    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase: {} }}>
          <UserContext.Provider value={{ user }}>
            <Profile />
          </UserContext.Provider>
        </FirebaseContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith(ROUTES.NOT_FOUND);
    });
  });
});
