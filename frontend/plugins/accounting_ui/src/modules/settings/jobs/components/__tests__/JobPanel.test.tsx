import { fireEvent, render, screen } from '@testing-library/react';
import { useSidePanel } from 'ui-modules';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { useJobDetail } from '@/settings/jobs/hooks/useJobDetail';
import {
  useJobAdd,
  useJobEdit,
  useJobRemove,
} from '@/settings/jobs/hooks/useJobMutations';
import { IJob, TJobForm } from '@/settings/jobs/types/Job';
import { jobFormValues } from '@/settings/jobs/utils/jobFormValues';
import { JOB_PANEL } from '../JobPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({
  Spinner: () => <div role="status">loading</div>,
  isDeeplyEqual: (a: unknown, b: unknown) =>
    JSON.stringify(a) === JSON.stringify(b),
}));
jest.mock('ui-modules', () => ({ useSidePanel: jest.fn() }));
jest.mock('@/settings/hooks/useSettingsPanel', () => ({
  useSettingsPanel: jest.fn(),
}));
jest.mock('@/settings/jobs/hooks/useJobDetail', () => ({
  useJobDetail: jest.fn(),
}));
jest.mock('@/settings/jobs/hooks/useJobMutations', () => ({
  useJobAdd: jest.fn(),
  useJobEdit: jest.fn(),
  useJobRemove: jest.fn(),
}));
jest.mock('@/settings/components/panel/SettingsPanelActions', () => ({
  SettingsPanelRemoveAction: ({
    onRemove,
  }: {
    onRemove: (onCompleted: () => void) => void;
  }) => <button onClick={() => onRemove(() => undefined)}>delete</button>,
}));
jest.mock('@/settings/jobs/components/JobForm', () => ({
  JobForm: ({
    form,
    onSubmit,
    onCancel,
  }: {
    form: { getValues: () => TJobForm };
    onSubmit: (data: TJobForm) => void;
    onCancel?: () => void;
  }) => (
    <>
      <span>{form.getValues().name}</span>
      <button onClick={() => onSubmit(form.getValues())}>save</button>
      <button
        onClick={() => onSubmit({ ...form.getValues(), name: 'Bread v2' })}
      >
        rename and save
      </button>
      <button onClick={onCancel}>cancel</button>
    </>
  ),
}));

const job: IJob = {
  _id: 'job-1',
  code: 'BR-01',
  name: 'Bread',
  description: '',
  duration: 30,
  durationType: 'minut',
  status: 'active',
  laborCosts: [],
  overheadCosts: [],
  inputs: [{ productId: 'flour', uom: 'kg', quantity: 2, costRatio: null }],
  outputs: [{ productId: 'bread', uom: 'ea', quantity: 10, costRatio: 1 }],
};

const panel = {
  openDraft: jest.fn(),
  openDetail: jest.fn(),
  cancelDraft: jest.fn(),
  closePanel: jest.fn(),
};
const close = jest.fn();
const addJob = jest.fn();
const editJob = jest.fn();
const removeJob = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useSettingsPanel).mockReturnValue(panel);
  jest
    .mocked(useSidePanel)
    .mockReturnValue({ close } as unknown as ReturnType<typeof useSidePanel>);
  jest.mocked(useJobAdd).mockReturnValue({ addJob, loading: false });
  jest.mocked(useJobEdit).mockReturnValue({ editJob, loading: false });
  jest.mocked(useJobRemove).mockReturnValue({ removeJob, loading: false });
});

const { New, Detail, Actions } = JOB_PANEL;

test('a saved draft card replaces itself with the created card detail', () => {
  addJob.mockImplementation(({ onCompleted }) =>
    onCompleted({ jobAdd: { _id: 'job-new' } }),
  );
  render(<New contentType="accounting:job" contentId="new" />);

  fireEvent.click(screen.getByText('save'));

  expect(addJob.mock.calls[0][0].variables).toMatchObject({
    durationType: 'minut',
    status: 'active',
    inputs: [{ productId: '', uom: '', quantity: 1 }],
    outputs: [{ productId: '', uom: '', quantity: 1, costRatio: 1 }],
  });
  expect(panel.openDetail).toHaveBeenCalledWith('job-new', { replace: true });
});

test('a draft stays open when the server returns no card, and cancel discards it', () => {
  addJob.mockImplementation(({ onCompleted }) => onCompleted({ jobAdd: null }));
  render(<New contentType="accounting:job" contentId="new" />);

  fireEvent.click(screen.getByText('save'));
  expect(panel.openDetail).not.toHaveBeenCalled();

  fireEvent.click(screen.getByText('cancel'));
  expect(panel.cancelDraft).toHaveBeenCalled();
});

test('the detail tab shows a spinner while loading and nothing for a missing card', () => {
  jest
    .mocked(useJobDetail)
    .mockReturnValue({ jobDetail: undefined, loading: true });
  const { rerender } = render(
    <Detail contentType="accounting:job" contentId="job-1" />,
  );
  expect(screen.getByRole('status')).toBeTruthy();

  jest
    .mocked(useJobDetail)
    .mockReturnValue({ jobDetail: undefined, loading: false });
  rerender(<Detail contentType="accounting:job" contentId="missing" />);
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.queryByText('save')).toBeNull();
});

test('a renamed card is updated in place and the panel stays open', () => {
  jest.mocked(useJobDetail).mockReturnValue({ jobDetail: job, loading: false });
  render(<Detail contentType="accounting:job" contentId="job-1" />);
  expect(screen.getByText('Bread')).toBeTruthy();

  fireEvent.click(screen.getByText('rename and save'));

  expect(editJob).toHaveBeenCalledWith({
    variables: { ...jobFormValues(job), _id: 'job-1', name: 'Bread v2' },
  });
  expect(close).not.toHaveBeenCalled();
});

test('saving an untouched card sends nothing and closes the panel like cancel', () => {
  jest.mocked(useJobDetail).mockReturnValue({ jobDetail: job, loading: false });
  render(<Detail contentType="accounting:job" contentId="job-1" />);

  fireEvent.click(screen.getByText('save'));

  expect(editJob).not.toHaveBeenCalled();
  expect(close).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByText('cancel'));
  expect(close).toHaveBeenCalledTimes(2);
});

test('deleting from the panel header removes that card', () => {
  if (!Actions) throw new Error('Job panel has no header actions');
  render(<Actions contentType="accounting:job" contentId="job-1" />);

  fireEvent.click(screen.getByText('delete'));

  expect(removeJob).toHaveBeenCalledWith(
    expect.objectContaining({ variables: { _id: 'job-1' } }),
  );
});
