import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import FirebaseContext from '../../context/firebase';
import Login from '../../pages/login';
import * as ROUTES from '../../constants/routes';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush
  })
}));

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

    expect(mockLoginSuccess).toHaveBeenCalledTimes(1);
    expect(mockLoginSuccess).toHaveBeenCalledWith('test@example.com', 'test123');

    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenCalledTimes(1);
      expect(mockHistoryPush).toHaveBeenCalledWith(ROUTES.DASHBOARD);
      expect(screen.getByPlaceholderText('Email address').value).toBe('test@example.com');
      expect(screen.getByPlaceholderText('Password').value).toBe('test123');
      expect(screen.queryByTestId('error')).toBeFalsy();
    });
  });

  it.todo('renders the login page with a form submission and fails to log a user in');
});
