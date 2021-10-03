import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import { doesUsernameExist } from '../../services/firebase';
import FirebaseContext from '../../context/firebase';
import SignUp from '../../pages/signup';
import * as ROUTES from '../../constants/routes';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: mockHistoryPush })
}));

jest.mock('../../services/firebase');

describe('<SignUp />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sign up page with a form submission and signs a user up', async () => {
    const firebase = {
      firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
          add: jest.fn().mockResolvedValue('User added')
        }))
      })),
      auth: jest.fn(() => ({
        createUserWithEmailAndPassword: jest.fn(() => ({
          user: { updateProfile: jest.fn().mockResolvedValue('I am signed up!') }
        }))
      }))
    };

    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <SignUp />
        </FirebaseContext.Provider>
      </Router>
    );

    expect(document.title).toBe('Sign Up - Instagram');

    userEvent.type(screen.getByPlaceholderText('Username'), 'karl');
    userEvent.type(screen.getByPlaceholderText('Full name'), 'Karl Hadwen');
    userEvent.type(screen.getByPlaceholderText('Email address'), 'karl@gmail.com');
    userEvent.type(screen.getByPlaceholderText('Password'), 'test123');
    userEvent.click(screen.getByRole('button', { type: 'submit' }));

    expect(doesUsernameExist).toHaveBeenCalled();
    expect(doesUsernameExist).toHaveBeenCalledTimes(1);
    expect(doesUsernameExist).toHaveBeenCalledWith('karl');

    expect(await screen.findByPlaceholderText('Username')).toHaveValue('karl');
    // await waitFor(() => {
    //   expect(screen.getByPlaceholderText('Username')).toHaveValue('karl');
    // });

    expect(mockHistoryPush).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it('renders the sign up page but an error is present (username exists)', async () => {
    const firebase = {
      auth: jest.fn(() => ({
        createUserWithEmailAndPassword: jest.fn(() => ({
          user: {
            updateProfile: jest.fn().mockRejectedValue(new Error('Username exists'))
          }
        }))
      }))
    };

    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <SignUp />
        </FirebaseContext.Provider>
      </Router>
    );

    expect(document.title).toBe('Sign Up - Instagram');
    userEvent.type(screen.getByPlaceholderText('Username'), 'karl');
    userEvent.type(screen.getByPlaceholderText('Full name'), 'Karl Hadwen');
    userEvent.type(screen.getByPlaceholderText('Email address'), 'karl@gmail.com');
    userEvent.type(screen.getByPlaceholderText('Password'), 'test123');
    userEvent.click(screen.getByRole('button', { type: 'submit' }));

    expect(doesUsernameExist).toHaveBeenCalledTimes(1);
    expect(doesUsernameExist).toHaveBeenCalledWith('karl');

    expect(await screen.findByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Username exists')).toBeInTheDocument();

    expect(mockHistoryPush).not.toHaveBeenCalled();

    expect(screen.getByPlaceholderText('Username')).toHaveValue('karl');
    expect(screen.getByPlaceholderText('Full name')).toHaveValue('Karl Hadwen');
    expect(screen.getByPlaceholderText('Email address')).toHaveValue('karl@gmail.com');
    expect(screen.getByPlaceholderText('Password')).toHaveValue('test123');
  });

  it('renders the sign up page but an error is thrown', async () => {
    const firebase = {};

    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <SignUp />
        </FirebaseContext.Provider>
      </Router>
    );

    doesUsernameExist.mockResolvedValue(true);

    expect(document.title).toEqual('Sign Up - Instagram');
    userEvent.type(screen.getByPlaceholderText('Username'), 'karl');
    userEvent.type(screen.getByPlaceholderText('Full name'), 'Karl Hadwen');
    userEvent.type(screen.getByPlaceholderText('Email address'), 'karl@gmail.com');
    userEvent.type(screen.getByPlaceholderText('Password'), 'test123');
    userEvent.click(screen.getByRole('button', { type: 'submit' }));

    expect(doesUsernameExist).toHaveBeenCalledTimes(1);
    expect(doesUsernameExist).toHaveBeenCalledWith('karl');

    expect(await screen.findByTestId('error')).toBeInTheDocument();

    expect(
      screen.getByText('That username is already taken, please try another.')
    ).toBeInTheDocument();

    expect(mockHistoryPush).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Username')).toHaveValue('karl');
    expect(screen.getByPlaceholderText('Full name')).toHaveValue('Karl Hadwen');
    expect(screen.getByPlaceholderText('Email address')).toHaveValue('karl@gmail.com');
    expect(screen.getByPlaceholderText('Password')).toHaveValue('test123');
  });
});
