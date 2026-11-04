import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { FacebookIntegrationDetail } from '../facebook/components/FacebookIntegrationDetail';
import { FacebookIntegrationPanelForm } from '../facebook/components/FacebookIntegrationForm';
import { InstagramIntegrationDetail } from '../instagram/components/InstagramIntegrationDetail';
import { InstagramIntegrationPanelForm } from '../instagram/components/InstagramIntegrationForm';
import {
  selectedFacebookAccountAtom,
  activeFacebookFormStepAtom,
} from '../facebook/states/facebookStates';
import {
  selectedInstagramAccountAtom,
  activeInstagramFormStepAtom,
} from '../instagram/states/instagramStates';

const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = jest.fn();
jest.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  useParams: () => ({ id: 'channel' }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({
  isDeeplyEqual: (left: unknown, right: unknown) =>
    JSON.stringify(left) === JSON.stringify(right),
  Button: ({ children, onClick }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick}>{children}</button>
  ),
}));
jest.mock('ui-modules', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai');
  return {
    useSidePanel: () => ({}),
    sidePanelDraftState: atom(null),
    getSidePanelRecordPath: () => 'frontline:integration/new',
  };
});
jest.mock('../facebook/components/FacebookGetAccounts', () => ({
  FacebookGetAccounts: () => <span>Facebook accounts</span>,
}));
jest.mock('../facebook/components/FacebookGetPages', () => ({
  FacebookGetPages: () => <span>Facebook pages</span>,
}));
jest.mock('../facebook/components/FacebookIntegrationSetup', () => ({
  FacebookIntegrationSetup: () => null,
}));
jest.mock('../instagram/components/InstagramGetAccounts', () => ({
  InstagramGetAccounts: () => <span>Instagram accounts</span>,
}));
jest.mock('../instagram/components/InstagramGetPages', () => ({
  InstagramGetPages: () => <span>Instagram pages</span>,
}));
jest.mock('../instagram/components/InstagramIntegrationSetup', () => ({
  InstagramIntegrationSetup: () => null,
}));

it.each(['facebook', 'instagram'])(
  '%s OAuth return keeps its account when the panel mounts',
  (provider) => {
    const store = createStore();
    mockSearchParams.forEach((_value, key) => mockSearchParams.delete(key));
    mockSearchParams.set(
      provider === 'facebook' ? 'fbAuthorized' : 'igAuthorized',
      'true',
    );
    mockSearchParams.set('accountId', 'authorized-account');
    const Detail =
      provider === 'facebook'
        ? FacebookIntegrationDetail
        : InstagramIntegrationDetail;
    const Panel =
      provider === 'facebook'
        ? FacebookIntegrationPanelForm
        : InstagramIntegrationPanelForm;
    const Frame = ({ children }: PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    );
    const screen = render(
      <Frame>
        <Detail />
      </Frame>,
    );
    screen.rerender(
      <Frame>
        <Detail />
        <Panel />
      </Frame>,
    );
    const account =
      provider === 'facebook'
        ? store.get(selectedFacebookAccountAtom)
        : store.get(selectedInstagramAccountAtom);
    const step =
      provider === 'facebook'
        ? store.get(activeFacebookFormStepAtom)
        : store.get(activeInstagramFormStepAtom);
    expect(account).toBe('authorized-account');
    expect(step).toBe(2);
  },
);
