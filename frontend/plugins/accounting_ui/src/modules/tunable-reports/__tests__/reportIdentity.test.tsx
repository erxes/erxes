import { ComponentProps, ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { ReportIdentityField } from '../ReportIdentityField';
import { ReportValues } from '../schema';

jest.mock('../locales', () => ({
  useReportTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const { Controller } = jest.requireActual('react-hook-form');
  const Block = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Form: {
      Field: Controller,
      Item: Block,
      Control: Block,
      Label: Block,
      Message: () => null,
    },
    Input: jest
      .requireActual<typeof import('react')>('react')
      .forwardRef<HTMLInputElement, ComponentProps<'input'>>((props, ref) => (
        <input {...props} ref={ref} />
      )),
    Button: ({
      children,
      onClick,
      ...props
    }: ComponentProps<'button'> & { variant?: string; size?: string }) => (
      <button type="button" aria-label={props['aria-label']} onClick={onClick}>
        {children}
      </button>
    ),
  };
});
const Editor = ({ name = '', code = '' }: { name?: string; code?: string }) => {
  const form = useForm<ReportValues>({ defaultValues: { name, code } });
  return <ReportIdentityField form={form} />;
};
test('code and name stay editable together until focus leaves the identity area', () => {
  render(<Editor />);
  const code = screen.getByPlaceholderText('code');
  const name = screen.getByPlaceholderText('name');
  fireEvent.focus(code);
  fireEvent.change(code, { target: { value: '01' } });
  fireEvent.blur(code, { relatedTarget: name });
  fireEvent.focus(name);
  fireEvent.change(name, { target: { value: 'Balance sheet' } });
  expect(screen.getAllByRole('textbox')).toHaveLength(2);
  expect(name.className).toBe('font-normal');
  fireEvent.blur(name);
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getByText('Balance sheet').className).toContain('font-bold');
  expect(screen.getByText('01').className).toContain('text-xs');
  fireEvent.click(screen.getByRole('button', { name: 'name: edit' }));
  expect(screen.getAllByRole('textbox')).toHaveLength(2);
  expect(screen.getByPlaceholderText('name').getAttribute('value')).toBe(
    'Balance sheet',
  );
});
test('saved identity initially displays code and bold name as text', () => {
  render(<Editor name="Cash flow" code="02" />);
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Cash flow' })).toBeTruthy();
  expect(screen.getByText('02')).toBeTruthy();
});
