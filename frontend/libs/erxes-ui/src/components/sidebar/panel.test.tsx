/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

import { SidebarPanel } from './panel';
import { sidebarPanelOpenState } from 'erxes-ui/state/sidebarPanelState';

describe('SidebarPanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the minimize button for an actions-only panel', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <SidebarPanel actions={<button type="button">Action</button>}>
          Panel content
        </SidebarPanel>
      </Provider>,
    );

    const minimizeButton = screen.getByRole('button', {
      name: 'Collapse sidebar',
    });

    expect(minimizeButton).toBeTruthy();
    expect(screen.getByText('Action')).toBeTruthy();

    fireEvent.click(minimizeButton);

    expect(store.get(sidebarPanelOpenState)).toBe(false);
  });
});
