const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { afterEach, test } = require('node:test');
const { runInThisContext } = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { JSDOM } = createRequire(require.resolve('jest-environment-jsdom'))(
  'jsdom',
);

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});
global.HTMLElement = dom.window.HTMLElement;
global.IS_REACT_ACT_ENVIRONMENT = true;
const { cleanup, fireEvent, render } = require('@testing-library/react');
afterEach(cleanup);

const element = React.createElement;
const Container = ({ children }) => element('div', null, children);
const Empty = () => null;
const translate = { useTranslation: () => ({ t: (key) => key }) };
const isDefined = (value) => value != null;
const load = (file, mocks) => {
  const compiled = ts.transpileModule(
    readFileSync(path.resolve(__dirname, file), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    },
  ).outputText;
  const exports = {};
  runInThisContext(`(function(exports, require) { ${compiled}\n})`)(
    exports,
    (name) => (Object.hasOwn(mocks, name) ? mocks[name] : require(name)),
  );
  return exports;
};

const attachments = load(
  '../../cards/components/detail/overview/attachments/AttachmentContext.tsx',
  {
    '@/deals/types/attachments': {
      toAttachmentInput: (attachment) => attachment,
    },
    '@/deals/context/DealContext': {
      useDealsContext: () => ({ editDeals: async () => ({}) }),
    },
    'erxes-ui': { useConfirm: () => ({ confirm: async () => {} }) },
  },
);
const pendingAttachment = {
  url: 'pending',
  name: 'pending.txt',
  type: 'text/plain',
  size: 1,
};
const AttachmentProbe = () => {
  const { attachments: values, addAttachment } =
    attachments.useAttachmentContext();
  return element(
    'button',
    { onClick: () => addAttachment(pendingAttachment) },
    values.map((item) => item.name).join(','),
  );
};
const { Overview } = load(
  '../../cards/components/detail/overview/Overview.tsx',
  {
    'erxes-ui': { isDefined, Separator: Empty },
    './attachments/AttachmentContext': attachments,
    './NoteAndComment': { SalesNoteAndComment: Empty },
    './SalesFormFields': { SalesFormFields: AttachmentProbe },
  },
);

for (const initial of [
  undefined,
  [null, { ...pendingAttachment, url: 'saved', name: 'saved.txt' }],
]) {
  test(`unrelated overview rerenders retain pending attachments (${
    initial ? 'existing list' : 'empty list'
  })`, () => {
    const deal = { _id: 'deal', attachments: initial };
    const view = render(element(Overview, { deal }));
    fireEvent.click(view.getByRole('button'));
    assert.match(view.getByRole('button').textContent, /pending.txt/);
    view.rerender(
      element(Overview, { deal: { ...deal, name: 'Updated title' } }),
    );
    assert.match(view.getByRole('button').textContent, /pending.txt/);
    const refreshed = [
      { ...pendingAttachment, url: 'new', name: 'server.txt' },
    ];
    view.rerender(
      element(Overview, { deal: { ...deal, attachments: refreshed } }),
    );
    assert.equal(view.getByRole('button').textContent, 'server.txt');
  });
}

const Tooltip = Object.assign(Container, {
  Provider: Container,
  Trigger: Container,
  Content: Container,
});
const { DealWidgetCard } = load(
  '../../../../widgets/relation/modules/DealWidgetCard.tsx',
  {
    '@tabler/icons-react': { IconBuildingSkyscraper: Empty, IconMapPin: Empty },
    'erxes-ui': {
      Badge: Container,
      Card: Container,
      isDefined,
      Separator: Empty,
      Tooltip,
    },
    'react-i18next': translate,
    '@/deals/cards/components/detail/overview/label/Labels': { Labels: Empty },
    '@/deals/cards/components/item/Footer': { ItemFooter: Empty },
    '@/deals/components/deal-selects/DateSelectDeal': { DateSelectDeal: Empty },
    '@/deals/components/deal-selects/PriorityInline': { PriorityBadge: Empty },
  },
);
test('relation cards omit all-null collections and retain valid department/branch entries', () => {
  const deal = {
    _id: 'deal',
    name: 'Related deal',
    departments: [null],
    branches: [null],
  };
  const view = render(element(DealWidgetCard, { deal }));
  assert.equal(view.queryByText('dept'), null);
  assert.equal(view.queryByText('branch'), null);
  view.rerender(
    element(DealWidgetCard, {
      deal: {
        ...deal,
        departments: [null, { title: 'Engineering' }],
        branches: [{ title: 'HQ' }, null],
      },
    }),
  );
  assert.ok(view.getByText('Engineering'));
  assert.ok(view.getByText('HQ'));
});

const Form = Object.assign(Container, { Field: Empty });
let pipelineId;
const notifications = [];
const mutations = [];
const { LabelForm } = load(
  '../../cards/components/detail/overview/label/LabelForm.tsx',
  {
    '@/deals/pipelines/hooks/usePipelineDetails': {
      usePipelineLabelDetail: () => ({}),
      usePipelineLabelAdd: () => ({
        addPipelineLabel: (options) => mutations.push(['add', options]),
      }),
      usePipelineLabelEdit: () => ({
        editPipelineLabel: (options) => mutations.push(['edit', options]),
      }),
      usePipelineLabelRemove: () => ({}),
    },
    'erxes-ui': {
      Button: ({ children, type }) => element('button', { type }, children),
      Form,
      Input: Empty,
      Popover: {
        Close: React.forwardRef(({ children }, ref) =>
          element('div', { ref }, children),
        ),
      },
      Spinner: Empty,
      cn: () => '',
      useConfirm: () => ({}),
      useQueryState: () => [pipelineId],
      toast: (notification) => notifications.push(notification),
    },
    './constants/labelFormSchema': { labelFormSchema: {} },
    './constants/colors': { COLORS: [] },
    '@hookform/resolvers/zod': { zodResolver: () => undefined },
    '@tabler/icons-react': { IconLoader: Empty },
    'react-color': { TwitterPicker: Empty },
    'react-hook-form': {
      useForm: () => ({
        handleSubmit: (submit) => (event) => {
          event.preventDefault();
          submit({ name: 'Label', colorCode: '#123456' });
        },
        reset: () => {},
      }),
    },
    'react-i18next': translate,
  },
);
test('a missing label pipeline reports an error; valid add/edit submissions retain their variables', () => {
  pipelineId = null;
  notifications.length = 0;
  mutations.length = 0;
  const view = render(element(LabelForm));
  fireEvent.click(view.getByRole('button', { name: 'save' }));
  assert.equal(mutations.length, 0);
  assert.equal(notifications[0]?.variant, 'destructive');
  pipelineId = 'pipeline';
  view.rerender(element(LabelForm));
  fireEvent.click(view.getByRole('button', { name: 'save' }));
  view.rerender(element(LabelForm, { labelId: 'label' }));
  fireEvent.click(view.getByRole('button', { name: 'save' }));
  assert.deepEqual(mutations, [
    [
      'add',
      {
        variables: {
          name: 'Label',
          colorCode: '#123456',
          pipelineId: 'pipeline',
        },
      },
    ],
    [
      'edit',
      {
        variables: {
          name: 'Label',
          colorCode: '#123456',
          pipelineId: 'pipeline',
          _id: 'label',
        },
      },
    ],
  ]);
});
