import { fireEvent, render, screen } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import type { ReactNode } from 'react';
import { ExecutionJobSelectContent } from '../SelectExecutionJob';

jest.mock('@apollo/client', () => ({ useQuery: jest.fn() }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('use-debounce', () => ({ useDebounce: (value: string) => [value] }));
jest.mock('erxes-ui', () => ({
  Command: Object.assign(
    ({ children }: { children: ReactNode }) => <div>{children}</div>,
    {
      Input: ({
        value,
        onValueChange,
      }: {
        value: string;
        onValueChange: (value: string) => void;
      }) => (
        <input
          aria-label="search"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
      ),
      List: 'div',
      Empty: () => null,
      Item: ({
        children,
        onSelect,
      }: {
        children: ReactNode;
        onSelect: () => void;
      }) => <button onClick={onSelect}>{children}</button>,
    },
  ),
  Combobox: {
    Check: ({ checked }: { checked: boolean }) =>
      checked ? <span>selected</span> : null,
  },
  Spinner: () => null,
}));

test.each([true, false])(
  'job selection searches by code/name and restricts active jobs only when activeOnly=%s',
  (activeOnly) => {
    const onChange = jest.fn();
    jest.mocked(useQuery).mockReturnValue({
      data: {
        jobs: {
          jobs: [
            {
              _id: 'job',
              code: '001',
              name: 'Assembly',
              inputs: [],
              outputs: [],
              laborCosts: [],
              overheadCosts: [],
            },
          ],
        },
      },
      loading: false,
    } as never);
    render(
      <ExecutionJobSelectContent
        onChange={onChange}
        activeOnly={activeOnly}
        selectedId="job"
      />,
    );
    fireEvent.change(screen.getByLabelText('search'), {
      target: { value: 'Assembly' },
    });
    expect(useQuery).toHaveBeenLastCalledWith(expect.anything(), {
      variables: {
        searchValue: 'Assembly',
        status: activeOnly ? 'active' : undefined,
        page: 1,
        perPage: 100,
      },
    });
    expect(screen.getByText('selected')).toBeTruthy();
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'job', code: '001', name: 'Assembly' }),
    );
  },
);
