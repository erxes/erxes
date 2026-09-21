import { fireEvent, render, screen } from '@testing-library/react';
import { ComponentProps, ReactNode } from 'react';
import { SlashMenu } from '../SlashMenu';

jest.mock('../SuggestionMenu', () => ({
  SuggestionMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SuggestionMenuItem: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

it('uses the controller callback so mouse selection clears the slash query', () => {
  const action = jest.fn();
  const onItemClick = jest.fn();
  const item: ComponentProps<typeof SlashMenu>['items'][number] = {
    title: 'Toggle Heading 1',
    onItemClick: action,
    icon: <span data-testid="toggle-icon" />,
  };

  render(
    <SlashMenu
      items={[item]}
      selectedIndex={0}
      loadingState="loaded"
      onItemClick={onItemClick}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Toggle Heading 1' }));

  expect(onItemClick).toHaveBeenCalledWith(item);
  expect(action).not.toHaveBeenCalled();
  expect(screen.getByTestId('toggle-icon')).toBeTruthy();
});
