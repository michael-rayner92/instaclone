import { render, screen } from '@testing-library/react';
import useAuthListener from '../hooks/use-auth-listener';
import App from '../App';

jest.mock('../hooks/use-auth-listener');

const user = {
  uid: 'NvPY9M9MzFTARQ6M816YAzDJxZ72',
  displayName: 'karl'
};

describe('<App />', () => {
  it('renders the App page', async () => {
    useAuthListener.mockReturnValue(user);

    render(<App />);

    expect(await screen.findByText(/^Loading/)).toBeInTheDocument();
  });
});
