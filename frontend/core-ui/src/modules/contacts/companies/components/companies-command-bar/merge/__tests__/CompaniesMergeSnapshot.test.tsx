/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { CompaniesMerge } from '../CompaniesMerge';

let mockSubmitted: string[] = [];
jest.mock('@/contacts/companies/hooks/useCompaniesForMerge', () => ({
  useCompaniesForMerge: () => ({ companies: [], loading: false }),
}));
jest.mock('@/contacts/companies/hooks/useCompaniesMergeFields', () => ({
  useCompaniesMergeFields: () => ({
    companyNames: [],
    conflicts: [],
    results: [],
    selectChoice: jest.fn(),
    getCompanyFields: jest.fn(),
  }),
}));
jest.mock('@/contacts/companies/hooks/useCompaniesMergeSubmit', () => ({
  useCompaniesMergeSubmit: ({ companyIds }: { companyIds: string[] }) => ({
    save: () => {
      mockSubmitted = companyIds;
    },
    saving: false,
  }),
}));
jest.mock('../CompaniesMergeContent', () => ({
  CompaniesMergeContent: () => null,
}));
jest.mock('../CompaniesMergeSheet', () => ({
  CompaniesMergeSheet: ({
    children,
    onOpenChange,
    onSave,
  }: PropsWithChildren<{
    onOpenChange?: (open: boolean) => void;
    onSave?: () => void;
  }>) => (
    <>
      <button onClick={() => onOpenChange?.(true)}>Open merge</button>
      {children}
      <button onClick={onSave}>Merge pair</button>
    </>
  ),
}));

it('keeps the open company pair when the selection drops below two rows', () => {
  mockSubmitted = [];
  const view = render(<CompaniesMerge companyIds={['a', 'b']} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open merge' }));
  view.rerender(<CompaniesMerge companyIds={['c']} />);
  fireEvent.click(screen.getByRole('button', { name: 'Merge pair' }));
  expect(mockSubmitted).toEqual(['a', 'b']);
});
