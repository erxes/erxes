/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { PanelField } from '../PanelField';
jest.mock('erxes-ui', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
  Label: (props: React.ComponentProps<'label'>) => <label {...props} />,
  RecordTableInlineCell: { Trigger: () => null },
}));
jest.mock('../PanelLabel', () => ({
  PanelLabel: ({ children }: React.PropsWithChildren) => children,
}));
it('names an empty control through its visible field label', () => {
  render(
    <PanelField label="Owner" placeholder="Owner" htmlFor="company-owner">
      <button id="company-owner" />
    </PanelField>,
  );
  expect(screen.getByRole('button', { name: 'Owner' }).id).toBe(
    'company-owner',
  );
});
