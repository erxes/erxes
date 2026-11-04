/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { EmailDisplay } from '../EmailDisplay';
import { PhoneDisplay } from '../PhoneDisplay';
import { ValidationStatus } from 'erxes-ui/types';

jest.mock('erxes-ui/components', () => ({
  ...jest.requireActual('../../../../components/badge'),
  ...jest.requireActual('../../../../components/button'),
}));

const emailProps = {
  primaryEmail: 'primary@example.com',
  emails: [
    'primary@example.com',
    '',
    'second@example.com',
    'third@example.com',
  ],
  emailValidationStatus: ValidationStatus.Valid,
};

it('summarizes distinct nonempty emails and opens the enclosing editor from the count', () => {
  const openEditor = jest.fn();
  const composeEmail = jest.fn();
  render(
    <button onClick={openEditor}>
      <EmailDisplay
        {...emailProps}
        maxVisible={1}
        onEmailClick={composeEmail}
      />
    </button>,
  );
  expect(screen.queryByText('primary@example.com')).not.toBeNull();
  expect(screen.queryByText('second@example.com')).toBeNull();
  fireEvent.click(screen.getByText('+2'));
  expect(openEditor).toHaveBeenCalledTimes(1);
  expect(composeEmail).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('primary@example.com'));
  expect(composeEmail).toHaveBeenCalledWith('primary@example.com');
  expect(openEditor).toHaveBeenCalledTimes(1);
});

it('keeps the full email display when no summary limit is requested', () => {
  render(<EmailDisplay {...emailProps} />);
  expect(screen.queryByText('second@example.com')).not.toBeNull();
  expect(screen.queryByText('third@example.com')).not.toBeNull();
  expect(screen.queryByText('+2')).toBeNull();
});

it('summarizes distinct phones without changing the first phone', () => {
  const { container } = render(
    <PhoneDisplay
      primaryPhone="+12025550123"
      phones={['+12025550123', '', '+12025550124']}
      maxVisible={1}
    />,
  );
  expect(container.textContent).toContain('0123');
  expect(container.textContent).not.toContain('0124');
  expect(screen.queryByText('+1')).not.toBeNull();
});

it('shows no count when the field is empty', () => {
  const { container } = render(
    <EmailDisplay primaryEmail="" emails={['']} maxVisible={1} />,
  );
  expect(container.textContent).toBe('');
});
