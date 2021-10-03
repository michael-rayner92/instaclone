import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from '../../pages/dashboard';
import UserContext from '../../context/user';
import FirebaseContext from '../../context/firebase';
import LoggedInUserContext from '../../context/logged-in-user';
import { getPhotos, getSuggestedProfiles } from '../../services/firebase';
import useUser from '../../hooks/use-user';
import userFixture from '../../fixtures/logged-in-user';
import photosFixture from '../../fixtures/timeline-photos';
import suggestedProfilesFixture from '../../fixtures/suggested-profiles';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ username: 'orwell' }),
  useHistory: () => ({ push: mockHistoryPush })
}));

jest.mock('../../services/firebase');
jest.mock('../../hooks/use-user');

const user = { uid: 'NvPY9M9MzFTARQ6M816YAzDJxZ72', displayName: 'karl' };

describe('<Dashboard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard with a user profile and follows a user from the suggested profile', async () => {
    getPhotos.mockResolvedValue(photosFixture);
    getSuggestedProfiles.mockResolvedValue(suggestedProfilesFixture);
    useUser.mockReturnValue({ user: userFixture });

    const firebase = {
      firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            update: jest.fn().mockResolvedValue('User added')
          }))
        }))
      }))
    };

    render(
      <Router>
        <FirebaseContext.Provider
          value={{
            firebase,
            FieldValue: {
              arrayUnion: jest.fn(),
              arrayRemove: jest.fn()
            }
          }}
        >
          <UserContext.Provider value={{ user }}>
            <LoggedInUserContext.Provider value={{ user: userFixture }}>
              <Dashboard user={user} />
            </LoggedInUserContext.Provider>
          </UserContext.Provider>
        </FirebaseContext.Provider>
      </Router>
    );

    expect(document.title).toBe('Instagram');

    expect(await screen.findByTitle(/Sign Out/i)).toBeInTheDocument();
    expect(screen.getAllByText(/raphael/i)).toBeTruthy();
    expect(screen.getByAltText(/Instagram/i)).toBeInTheDocument();
    expect(screen.getByAltText(/karl's profile avatar/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Saint George and the Dragon/i)).toBeTruthy();
    expect(screen.getByText(/Suggestions for you/i)).toBeInTheDocument();

    expect(await screen.findByTestId(/follow-btn-utH4EadD3gBUbQkdG6Da/i)).toBeInTheDocument();

    // Follow a user
    userEvent.click(screen.getByTestId(/follow-btn-utH4EadD3gBUbQkdG6Da/i));
    expect(screen.queryByTestId(/follow-btn-utH4EadD3gBUbQkdG6Da/i)).not.toBeInTheDocument();

    const photoDocId = '494LKmaF03bUcYZ4xhNu';

    // Like a photo click
    expect(await screen.findByTestId(`like-photo-${photoDocId}`)).toBeInTheDocument();

    // Like Photo with click
    userEvent.click(screen.getByTestId(`like-photo-${photoDocId}`));
    expect(await screen.findByTestId(`like-photo-${photoDocId}`)).toHaveClass('text-black-light');

    // Unlike Photo with keydown
    fireEvent.keyDown(screen.getByTestId(`like-photo-${photoDocId}`), { key: 'Enter' });
    expect(screen.getByTestId(`like-photo-${photoDocId}`)).toHaveFocus();
    expect(await screen.findByTestId(`like-photo-${photoDocId}`)).toHaveClass('text-red-primary');

    // Commenting
    const commentDocId = 'nJMT1l8msuNZ8tH3zvVI';
    const inputEl = screen.getByTestId(`add-comment-${commentDocId}`);
    const submitBtnEl = screen.getByTestId(`add-comment-submit-${commentDocId}`);

    // Click to comment
    userEvent.click(screen.getByTestId(`focus-input-${commentDocId}`));
    expect(inputEl).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId(`focus-input-${commentDocId}`), { key: 'Enter' });
    expect(inputEl).toHaveFocus();

    // Leave a comment on a photo
    userEvent.type(inputEl, 'Great Photo!');
    fireEvent.submit(submitBtnEl);

    // Attempt to leave a comment on a photo with an invalid string length
    userEvent.type(inputEl, '{selectall}{backspace}');
    fireEvent.submit(submitBtnEl);

    // Toggle Focus
    fireEvent.keyDown(screen.getByTestId('focus-input-494LKmaF03bUcYZ4xhNu', { key: 'Enter' }));
    fireEvent.submit(submitBtnEl);
  });

  it('renders the dashboard with a user object of undefined to trigger fallbacks', async () => {
    getPhotos.mockResolvedValue(photosFixture);
    getSuggestedProfiles.mockResolvedValue(suggestedProfilesFixture);
    useUser.mockReturnValue({ user: undefined });

    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase: {} }}>
          <UserContext.Provider value={{ user }}>
            <LoggedInUserContext.Provider value={{ user: userFixture }}>
              <Dashboard user={user} />
            </LoggedInUserContext.Provider>
          </UserContext.Provider>
        </FirebaseContext.Provider>
      </Router>
    );

    expect(document.title).toBe('Instagram');
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('renders the dashboard with a user profile and has no suggested profile', async () => {
    getPhotos.mockResolvedValue(photosFixture);
    getSuggestedProfiles.mockResolvedValue([]);
    useUser.mockReturnValue({ user: userFixture });

    const firebase = {
      firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            update: jest.fn(() => Promise.resolve('User added'))
          }))
        }))
      }))
    };

    render(
      <Router>
        <FirebaseContext.Provider
          value={{
            firebase,
            FieldValue: {
              arrayUnion: jest.fn(),
              arrayRemove: jest.fn()
            }
          }}
        >
          <UserContext.Provider value={{ user }}>
            <LoggedInUserContext.Provider value={{ user: userFixture }}>
              <Dashboard user={user} />
            </LoggedInUserContext.Provider>
          </UserContext.Provider>
        </FirebaseContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(document.title).toBe('Instagram');
    });

    expect(screen.queryByText('Suggestions for you')).not.toBeInTheDocument();
  });
});
