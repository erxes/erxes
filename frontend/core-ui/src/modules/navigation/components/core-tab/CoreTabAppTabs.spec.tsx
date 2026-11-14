import { CoreTabAppTabs } from '@/navigation/components/core-tab/CoreTabAppTabs';
import type { CoreTabOrientation } from '@/navigation/components/core-tab/CoreTab';
import type { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { fireEvent, render } from '@testing-library/react';

jest.mock('react-router-dom', () => {
  const { createContext } = jest.requireActual<typeof import('react')>('react');
  return { UNSAFE_DataRouterStateContext: createContext(null) };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('erxes-ui', () => {
  const { createElement, Fragment } =
    jest.requireActual<typeof import('react')>('react');
  const Wrapper = ({ children }: import('react').PropsWithChildren) =>
    createElement(Fragment, null, children);
  return {
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
    Button: 'button',
    ContextMenu: Object.assign(Wrapper, {
      Trigger: Wrapper,
      Content: () => null,
      Item: Wrapper,
    }),
  };
});

const tabs: INavigationActivity[] = ['sales', 'frontline', 'contacts'].map(
  (id) => ({ id, label: id, kind: 'plugin', defaultPath: id, modules: [] }),
);

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe.each<{
  orientation: CoreTabOrientation;
  next: string;
  previous: string;
  unrelated: string;
}>([
  {
    orientation: 'horizontal',
    next: 'ArrowRight',
    previous: 'ArrowLeft',
    unrelated: 'ArrowDown',
  },
  {
    orientation: 'vertical',
    next: 'ArrowDown',
    previous: 'ArrowUp',
    unrelated: 'ArrowRight',
  },
])('$orientation app tabs', ({ orientation, next, previous, unrelated }) => {
  const setup = () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    const view = render(
      <CoreTabAppTabs
        activeTabId="sales"
        orientation={orientation}
        tabs={tabs}
        onSelect={onSelect}
        onClose={onClose}
        onCloseOthers={jest.fn()}
        onCloseToRight={jest.fn()}
        onMove={jest.fn()}
      />,
    );
    return { ...view, onSelect, onClose, elements: view.getAllByRole('tab') };
  };

  it('keeps one tab stop and uses the matching arrow axis with wrapping', () => {
    const { getByRole, elements, onSelect } = setup();
    expect(getByRole('tablist').getAttribute('aria-orientation')).toBe(
      orientation,
    );
    expect(elements.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);

    fireEvent.keyDown(elements[0], { key: previous });
    expect(document.activeElement).toBe(elements[2]);
    expect(onSelect).toHaveBeenLastCalledWith('contacts');
    expect(elements.map((tab) => tab.tabIndex)).toEqual([-1, -1, 0]);

    fireEvent.keyDown(elements[2], { key: next });
    expect(document.activeElement).toBe(elements[0]);
    expect(onSelect).toHaveBeenLastCalledWith('sales');
  });

  it('leaves arrows on the other axis alone', () => {
    const { elements, onSelect } = setup();
    fireEvent.keyDown(elements[0], { key: unrelated });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('supports Home, End and closing from the keyboard', () => {
    const { elements, onSelect, onClose } = setup();
    fireEvent.keyDown(elements[0], { key: 'End' });
    expect(document.activeElement).toBe(elements[2]);
    expect(onSelect).toHaveBeenLastCalledWith('contacts');
    fireEvent.keyDown(elements[2], { key: 'Home' });
    expect(document.activeElement).toBe(elements[0]);
    fireEvent.keyDown(elements[0], { key: 'Delete' });
    expect(onClose).toHaveBeenCalledWith('sales');
  });
});
