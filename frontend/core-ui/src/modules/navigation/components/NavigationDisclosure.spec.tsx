import { NavigationDisclosure } from '@/navigation/components/NavigationDisclosure';
import { animateNavigationDisclosure } from '@/navigation/utils/navigationDisclosureMotion';
import { render } from '@testing-library/react';

jest.mock('erxes-ui', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/navigation/utils/navigationDisclosureMotion', () => ({
  animateNavigationDisclosure: jest.fn(),
}));

const animate = jest.mocked(animateNavigationDisclosure);

const renderDisclosure = (open: boolean) =>
  render(
    <NavigationDisclosure open={open}>
      <span>Customers</span>
    </NavigationDisclosure>,
  );

const getContainer = (element: HTMLElement) =>
  element.firstElementChild as HTMLElement;

describe('NavigationDisclosure', () => {
  beforeEach(() => {
    animate.mockClear();
  });

  it('renders open content without animating on mount', () => {
    const { container, getByText } = renderDisclosure(true);

    expect(getByText('Customers')).toBeTruthy();
    expect(getContainer(container).getAttribute('aria-hidden')).toBe('false');
    expect(animate).not.toHaveBeenCalled();
  });

  it('does not mount its content before the first open', () => {
    const { container, queryByText } = renderDisclosure(false);

    expect(queryByText('Customers')).toBeNull();
    expect(getContainer(container).className).toContain('h-0');
  });

  it('mounts the content and animates it open in the same commit', () => {
    const { container, getByText, rerender } = renderDisclosure(false);

    rerender(
      <NavigationDisclosure open>
        <span>Customers</span>
      </NavigationDisclosure>,
    );

    const disclosure = getContainer(container);

    expect(getByText('Customers')).toBeTruthy();
    expect(disclosure.className).not.toContain('h-0');
    expect(animate).toHaveBeenCalledWith(
      disclosure,
      disclosure.firstElementChild,
      true,
    );
  });

  it('collapses with an animation and keeps the content mounted', () => {
    const { container, getByText, rerender } = renderDisclosure(true);

    rerender(
      <NavigationDisclosure open={false}>
        <span>Customers</span>
      </NavigationDisclosure>,
    );

    const disclosure = getContainer(container);

    expect(disclosure.getAttribute('aria-hidden')).toBe('true');
    expect(disclosure.className).toContain('h-0');
    expect(getByText('Customers')).toBeTruthy();
    expect(animate).toHaveBeenCalledWith(
      disclosure,
      disclosure.firstElementChild,
      false,
    );
  });
});
