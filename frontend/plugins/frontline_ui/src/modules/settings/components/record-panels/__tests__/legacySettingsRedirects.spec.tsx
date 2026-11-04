import { fireEvent, render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { PipelineLayoutPage } from '~/pages/PipelineLayoutPage';
import { ResponseDetail } from '@/responseTemplate/components/ResponseDetail';

jest.mock('react-router-dom', () => {
  const { TextEncoder, TextDecoder } =
    jest.requireActual<typeof import('node:util')>('node:util');
  Object.assign(globalThis, { TextEncoder, TextDecoder });
  return jest.requireActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
});
jest.mock('erxes-ui', () => ({ Spinner: () => null }));
jest.mock('ui-modules', () => ({
  getSidePanelRecordPath: ({
    contentType,
    contentId,
  }: {
    contentType: string;
    contentId: string;
  }) => `/detail/${contentType}/${contentId}`,
}));
jest.mock('@/responseTemplate/components/CreateResponseForm', () => ({
  CreateResponseForm: () => null,
}));
jest.mock('@/responseTemplate/hooks/useUpdateResponses', () => ({
  useUpdateResponse: jest.fn(),
}));
jest.mock('@/responseTemplate/hooks/useAddResponse', () => ({
  useResponseAdd: jest.fn(),
}));
jest.mock('@/shared/hooks/usePanelFormDraft', () => ({
  usePanelFormDraft: jest.fn(),
}));

const LocationProbe = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output aria-label="Destination path">{pathname}</output>
      <output aria-label="Destination query">{search}</output>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
};

const renderLegacyRoute = (legacy: string) =>
  render(
    <MemoryRouter initialEntries={['/previous', legacy]} initialIndex={1}>
      <Routes>
        <Route path="/previous" element={<p>Previous page</p>} />
        <Route
          path="/frontline/settings/channels/:id/pipelines/:pipelineId/*"
          element={<PipelineLayoutPage />}
        />
        <Route
          path="/frontline/settings/channels/:id/response/:responseId"
          element={<ResponseDetail />}
        />
        <Route
          path="/frontline/settings/channels/:id/pipelines"
          element={<LocationProbe />}
        />
        <Route
          path="/frontline/settings/channels/:id/response"
          element={<LocationProbe />}
        />
      </Routes>
    </MemoryRouter>,
  );

const readDestination = async () => ({
  pathname: (await screen.findByLabelText('Destination path')).textContent,
  query: new URLSearchParams(
    screen.getByLabelText('Destination query').textContent ?? '',
  ),
});

test.each(['', 'statuses', 'configs', 'permissions', 'properties', 'mail'])(
  'a legacy pipeline %s link opens the matching panel section and preserves filters',
  async (segment) => {
    const suffix = segment ? `/${segment}` : '';
    renderLegacyRoute(
      `/frontline/settings/channels/source-channel/pipelines/pipeline-1${suffix}?searchValue=needs+review&tagId=one&tagId=two&channelId=foreign-filter&panel=%2Fdetail%2Fcore%3Acustomer%2Fold`,
    );

    const { pathname, query } = await readDestination();

    expect(pathname).toBe(
      '/frontline/settings/channels/source-channel/pipelines',
    );
    expect(query.getAll('panel')).toEqual([
      `/detail/frontline:pipeline/pipeline-1${segment ? `~${segment}` : ''}`,
    ]);
    expect(query.get('searchValue')).toBe('needs review');
    expect(query.getAll('tagId')).toEqual(['one', 'two']);
    expect(query.get('channelId')).toBe('foreign-filter');
  },
);

test('a legacy response link opens its record and preserves encoded and repeated filters', async () => {
  renderLegacyRoute(
    '/frontline/settings/channels/source-channel/response/response-1?searchValue=%D1%82%D0%B5%D1%81%D1%82&status=active&tagId=one&tagId=two&extra=keep%2Fthis%3F%3D&panel=old',
  );

  const { pathname, query } = await readDestination();

  expect(pathname).toBe('/frontline/settings/channels/source-channel/response');
  expect(query.getAll('panel')).toEqual([
    '/detail/frontline:response-template/response-1',
  ]);
  expect(query.get('searchValue')).toBe('тест');
  expect(query.get('status')).toBe('active');
  expect(query.getAll('tagId')).toEqual(['one', 'two']);
  expect(query.get('extra')).toBe('keep/this?=');
});

test.each([
  '/frontline/settings/channels/source-channel/pipelines/pipeline-1/properties',
  '/frontline/settings/channels/source-channel/response/response-1',
])('the legacy adapter replaces history for %s', async (legacy) => {
  renderLegacyRoute(legacy);
  await readDestination();

  fireEvent.click(screen.getByText('Back'));

  expect(await screen.findByText('Previous page')).toBeTruthy();
});
