import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import FirebaseContext from '../../context/firebase';
import Login from '../../pages/login';
import * as ROUTES from '../../constants/routes';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: mockHistoryPush })
}));

jest.mock('../../services/firebase');

describe('<Login />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login page with a form submission and logs the user in', async () => {
    const mockLoginSuccess = jest.fn().mockResolvedValue('I am signed in');
    const firebase = {
      auth: jest.fn(() => ({
        signInWithEmailAndPassword: mockLoginSuccess
      }))
    };

    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <Login />
        </FirebaseContext.Provider>
      </Router>
    );

    userEvent.type(screen.getByPlaceholderText('Email address'), 'test@example.com');
    userEvent.type(screen.getByPlaceholderText('Password'), 'test123');

    expect(document.title).toEqual('Login - Instagram');

    userEvent.click(screen.getByTestId('login-btn'));
    fireEvent.keyDown(screen.getByTestId('login-btn'), { key: 'Enter' });

    expect(mockLoginSuccess).toHaveBeenCalledTimes(1);
    expect(mockLoginSuccess).toHaveBeenCalledWith('test@example.com', 'test123');

    expect(await screen.findByPlaceholderText('Email address')).toHaveValue('test@example.com');
    expect(screen.getByPlaceholderText('Email address')).toHaveValue('test@example.com');
    expect(screen.getByPlaceholderText('Password')).toHaveValue('test123');
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(mockHistoryPush).toHaveBeenCalledTimes(1);
    expect(mockHistoryPush).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it('renders the login page with a form submission and fails to log a user in', async () => {
    const mockLoginFailure = jest.fn().mockRejectedValue(new Error('Cannot sign in'));
    const firebase = {
      auth: jest.fn(() => ({
        signInWithEmailAndPassword: mockLoginFailure
      }))
    };

    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <Login />
        </FirebaseContext.Provider>
      </Router>
    );

    expect(document.title).toEqual('Login - Instagram');
    userEvent.type(screen.getByPlaceholderText('Email address'), 'test.com');
    userEvent.type(screen.getByPlaceholderText('Password'), 'test123');

    userEvent.click(screen.getByTestId('login-btn'));
    // fireEvent.keydown(screen.getByTestId('login-btn'), { key: 'Enter' });

    expect(mockLoginFailure).toHaveBeenCalledTimes(1);
    expect(mockLoginFailure).toHaveBeenCalledWith('test.com', 'test123');

    expect(await screen.findByTestId('error')).toBeInTheDocument();

    expect(screen.getByText('Cannot sign in')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address').value).toBe('test.com');
    expect(screen.getByPlaceholderText('Password').value).toBe('test123');
    expect(mockHistoryPush).not.toHaveBeenCalled();
  });
});
