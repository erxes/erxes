import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { JobDuration } from '@/settings/jobs/components/JobDuration';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({
  RecordTableInlineCell: ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  ),
}));

test('real jobs show a translated unit without the numeric duration', () => {
  render(<JobDuration durationType="real" duration={30} />);
  expect(screen.getByText('job-duration-real')).toBeTruthy();
  expect(screen.queryByText('30')).toBeNull();
});

test.each([
  { durationType: 'hour', duration: 0, expected: '0 job-duration-hour' },
  { durationType: 'day', duration: undefined, expected: '- job-duration-day' },
])(
  'fixed-duration display retains zero and missing values: $expected',
  ({ durationType, duration, expected }) => {
    render(<JobDuration durationType={durationType} duration={duration} />);
    expect(screen.getByText(expected)).toBeTruthy();
  },
);
