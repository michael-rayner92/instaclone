import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import userFixture from '../../fixtures/logged-in-user';
import FirebaseContext from '../../context/firebase';
import UserContext from '../../context/user';
import NotFound from '../../pages/not-found';

const firebase = {
  auth: jest.fn(() => ({
    createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: { updateProfile: jest.fn().mockResolvedValue(userFixture) }
    })
  }))
};

describe('<NotFound />', () => {
  it('renders the not found page with a logged in user', () => {
    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <UserContext.Provider value={{ user: {} }}>
            <NotFound />
          </UserContext.Provider>
        </FirebaseContext.Provider>
      </Router>
    );

    expect(screen.getByText('404: Page Not Found!')).toBeInTheDocument();
    expect(document.title).toBe('Not Found - Instagram');
  });

  it('renders the not found page with no active logged in user', () => {
    render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <UserContext.Provider value={{ user: null }}>
            <NotFound />
          </UserContext.Provider>
        </FirebaseContext.Provider>
      </Router>
    );

    expect(screen.getByText('404: Page Not Found!')).toBeInTheDocument();
    expect(document.title).toBe('Not Found - Instagram');
  });
});
