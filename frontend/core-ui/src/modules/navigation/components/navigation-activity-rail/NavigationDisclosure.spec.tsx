import { NavigationDisclosure } from '@/navigation/components/navigation-activity-rail/NavigationDisclosure';
import { render } from '@testing-library/react';

jest.mock('erxes-ui', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

const renderDisclosure = (open: boolean) =>
  render(
    <NavigationDisclosure open={open}>
      <span>Customers</span>
    </NavigationDisclosure>,
  );

const getContainer = (element: HTMLElement) =>
  element.firstElementChild as HTMLElement;

describe('NavigationDisclosure', () => {
  it('renders open content', () => {
    const { container, getByText } = renderDisclosure(true);

    expect(getByText('Customers')).toBeTruthy();
    expect(getContainer(container).getAttribute('aria-hidden')).toBe('false');
    expect(getContainer(container).className).toContain('grid-rows-[1fr]');
  });

  it('does not mount its content before the first open', () => {
    const { container, queryByText } = renderDisclosure(false);

    expect(queryByText('Customers')).toBeNull();
    expect(getContainer(container).className).toContain('grid-rows-[0fr]');
  });

  it('mounts the content and expands it in the same commit', () => {
    const { container, getByText, rerender } = renderDisclosure(false);

    rerender(
      <NavigationDisclosure open>
        <span>Customers</span>
      </NavigationDisclosure>,
    );

    const disclosure = getContainer(container);

    expect(getByText('Customers')).toBeTruthy();
    expect(disclosure.className).toContain('grid-rows-[1fr]');
    expect(disclosure.className).not.toContain('invisible');
  });

  it('collapses and keeps the content mounted', () => {
    const { container, getByText, rerender } = renderDisclosure(true);

    rerender(
      <NavigationDisclosure open={false}>
        <span>Customers</span>
      </NavigationDisclosure>,
    );

    const disclosure = getContainer(container);

    expect(disclosure.getAttribute('aria-hidden')).toBe('true');
    expect(disclosure.className).toContain('grid-rows-[0fr]');
    expect(disclosure.className).toContain('invisible');
    expect(getByText('Customers')).toBeTruthy();
  });
});
