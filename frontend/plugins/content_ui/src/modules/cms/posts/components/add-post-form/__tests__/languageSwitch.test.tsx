import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, act } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import React from 'react';
import { AddPostForm } from '../AddPostForm';
import { CONTENT_CMS_LIST, CMS_POST, CMS_TRANSLATIONS } from '../../../../graphql/queries';
import { CMS_CUSTOM_FIELD_GROUPS } from '../../../../custom-fields/graphql/queries';
import { CMS_POSTIZ_TENANT_ENABLED } from '../../../postiz/graphql';

// Same shape as the inline COMBINED_CMS_DATA in usePostData (matched by
// printed query + variables in MockedProvider).
const COMBINED_CMS_DATA = gql`
  query CombinedCmsData(
    $clientPortalId: String!
    $limit: Int
    $language: String
  ) {
    cmsCategories(clientPortalId: $clientPortalId, limit: $limit) {
      list {
        _id
        name
        parentId
      }
    }
    cmsTags(
      clientPortalId: $clientPortalId
      limit: $limit
      language: $language
    ) {
      tags {
        _id
        name
        colorCode
      }
    }
    cmsCustomPostTypes(clientPortalId: $clientPortalId) {
      _id
      code
      label
      description
    }
  }
`;

jest.mock('erxes-ui', () => {
  const React = jest.requireActual('react');
  const { useController } = jest.requireActual('react-hook-form');

  const Field = ({ control, name, render }: any) => {
    const { field } = useController({ control, name });
    return render({
      field: { ...field, value: field.value ?? '' },
    });
  };

  const passthrough = (name: string) => {
    const C = ({ children, className }: any) =>
      React.createElement('div', { className, 'data-mock': name }, children);
    C.displayName = name;
    return C;
  };

  const Form = Object.assign(
    ({ children }: any) => React.createElement(React.Fragment, null, children),
    {
      Field,
      Item: passthrough('Form.Item'),
      Label: ({ children }: any) =>
        React.createElement('label', null, children),
      Control: ({ children }: any) =>
        React.createElement(React.Fragment, null, children),
      Message: () => null,
      Description: ({ children }: any) =>
        React.createElement('div', null, children),
    },
  );

  const withStatics = (statics: string[]) => {
    const C = ({ children }: any) =>
      React.createElement('div', null, children);
    for (const s of statics) {
      (C as any)[s] = passthrough(s);
    }
    return C;
  };

  return {
    Form,
    Input: (props: any) => React.createElement('input', props),
    Textarea: (props: any) => React.createElement('textarea', props),
    Button: (props: any) => React.createElement('button', props),
    ScrollArea: ({ children }: any) =>
      React.createElement('div', null, children),
    Sheet: withStatics([
      'View',
      'Header',
      'Title',
      'Description',
      'Content',
      'Close',
    ]),
    Tabs: Object.assign(
      ({ children }: any) => React.createElement('div', null, children),
      {
        List: passthrough('Tabs.List'),
        Trigger: ({ children }: any) =>
          React.createElement('button', null, children),
      },
    ),
    Select: Object.assign(
      ({ children }: any) => React.createElement('div', null, children),
      {
        Trigger: passthrough('Select.Trigger'),
        Content: passthrough('Select.Content'),
        Item: passthrough('Select.Item'),
        Value: () => null,
      },
    ),
    Switch: () => null,
    Accordion: Object.assign(
      ({ children }: any) => React.createElement('div', null, children),
      {
        Item: passthrough('Accordion.Item'),
        Trigger: passthrough('Accordion.Trigger'),
        Content: passthrough('Accordion.Content'),
      },
    ),
    toast: jest.fn(),
    useToast: () => ({ toast: jest.fn() }),
    __esModule: true,
  };
});

jest.mock('erxes-ui/utils', () => ({
  REACT_APP_API_URL: '',
  __esModule: true,
}));

jest.mock('erxes-ui/utils/core', () => ({
  readImage: (key: string) => key,
  __esModule: true,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ state: null, search: '', pathname: '/' }),
  useSearchParams: () => [new URLSearchParams()],
  useNavigate: () => jest.fn(),
  useParams: () => ({ websiteId: 'w1' }),
}));

jest.mock('../../../postiz/PostizDeliveryList', () => ({
  PostizDeliveryList: () => null,
  __esModule: true,
}));

jest.mock('~/modules/cms/shared/components/CmsUnsavedChangesAlert', () => ({
  CmsUnsavedChangesAlert: () => null,
  __esModule: true,
}));

jest.mock('../../../components/CmsPostEditor', () => ({
  CmsPostEditor: ({ initialContent }: any) => (
    <div data-testid="editor-content">{initialContent}</div>
  ),
  __esModule: true,
}));

jest.mock('../../PostPublicUrlButton', () => ({
  PostPublicUrlButton: () => null,
  __esModule: true,
}));

jest.mock('../CategoryField', () => ({
  CategoryField: () => null,
  __esModule: true,
}));

jest.mock('../TagField', () => ({
  TagField: () => null,
  __esModule: true,
}));

jest.mock('../MediaSection', () => ({
  MediaSection: () => null,
  __esModule: true,
}));

jest.mock('../CustomFieldsSection', () => ({
  CustomFieldsSection: () => null,
  __esModule: true,
}));

const combinedResult = {
  cmsCategories: { list: [] },
  cmsTags: { tags: [] },
  cmsCustomPostTypes: [],
};

const mocks: any[] = [
  {
    request: {
      query: COMBINED_CMS_DATA,
      variables: { clientPortalId: 'w1', limit: 100, language: '' },
    },
    result: { data: combinedResult },
  },
  {
    request: {
      query: COMBINED_CMS_DATA,
      variables: { clientPortalId: 'w1', limit: 100, language: 'en' },
    },
    result: { data: combinedResult },
  },
  {
    request: {
      query: COMBINED_CMS_DATA,
      variables: { clientPortalId: 'w1', limit: 100, language: 'mn' },
    },
    result: { data: combinedResult },
  },
  {
    request: { query: CONTENT_CMS_LIST },
    result: {
      data: {
        contentCMSList: [
          {
            clientPortalId: 'w1',
            languages: ['en', 'mn'],
            language: 'en',
            postUrlField: 'slug',
          },
        ],
      },
    },
  },
  {
    request: {
      query: CMS_CUSTOM_FIELD_GROUPS,
      variables: { clientPortalId: 'w1' },
    },
    result: { data: { cmsCustomFieldGroupList: { list: [] } } },
  },
];

describe('AddPostForm language switching (create mode)', () => {
  test('EN -> MN -> EN -> MN keeps each language title separate', async () => {
    const handleRef: { current?: (lang: string) => void } = {};

    render(
      <JotaiProvider>
        <MockedProvider mocks={mocks} addTypename={false}>
          <AddPostForm
            websiteId="w1"
            onFormReady={(state) => {
              handleRef.current = state.handleLanguageChange;
            }}
          />
        </MockedProvider>
      </JotaiProvider>,
    );

    const titleInput = (await screen.findByPlaceholderText(
      'post-title-placeholder',
    )) as HTMLInputElement;

    expect(handleRef.current).toBeDefined();

    fireEvent.change(titleInput, { target: { value: 'this is the title' } });
    expect(titleInput.value).toBe('this is the title');

    act(() => {
      handleRef.current?.('mn');
    });
    expect(titleInput.value).toBe('');

    fireEvent.change(titleInput, { target: { value: 'MN гарчиг' } });
    expect(titleInput.value).toBe('MN гарчиг');

    act(() => {
      handleRef.current?.('en');
    });
    expect(titleInput.value).toBe('this is the title');

    act(() => {
      handleRef.current?.('mn');
    });
    expect(titleInput.value).toBe('MN гарчиг');
  });

  test('edit mode: EN -> MN -> EN -> MN keeps server + edited MN data', async () => {
    const editMocks: any[] = [
      ...mocks,
      {
        request: { query: CMS_POST, variables: { id: 'p1' } },
        result: {
          data: {
            cmsPost: {
              _id: 'p1',
              title: 'this is the title',
              slug: 'hello',
              content: '<p>EN body</p>',
              excerpt: 'EN excerpt',
              type: 'post',
              status: 'draft',
              categoryIds: [],
              tagIds: [],
              customFieldsData: [],
            },
          },
        },
      },
      {
        request: {
          query: CMS_TRANSLATIONS,
          variables: { objectId: 'p1', type: 'post' },
        },
        result: {
          data: {
            cmsTranslations: [
              {
                language: 'mn',
                title: 'MN old',
                content: '<p>MN body</p>',
                excerpt: 'MN excerpt',
                customFieldsData: [],
              },
            ],
          },
        },
      },
      {
        request: { query: CMS_POSTIZ_TENANT_ENABLED },
        result: { data: { agentPostizTenantEnabled: false } },
      },
    ];

    const handleRef: { current?: (lang: string) => void } = {};

    render(
      <JotaiProvider>
        <MockedProvider mocks={editMocks} addTypename={false}>
          <AddPostForm
            websiteId="w1"
            editingPost={{ _id: 'p1' }}
            onFormReady={(state) => {
              handleRef.current = state.handleLanguageChange;
            }}
          />
        </MockedProvider>
      </JotaiProvider>,
    );

    const titleInput = (await screen.findByPlaceholderText(
      'post-title-placeholder',
    )) as HTMLInputElement;

    // wait for the loaded EN post
    await screen.findByDisplayValue('this is the title');
    expect(titleInput.value).toBe('this is the title');

    act(() => {
      handleRef.current?.('mn');
    });
    expect(titleInput.value).toBe('MN old');

    fireEvent.change(titleInput, { target: { value: 'MN new' } });

    act(() => {
      handleRef.current?.('en');
    });
    expect(titleInput.value).toBe('this is the title');

    act(() => {
      handleRef.current?.('mn');
    });
    expect(titleInput.value).toBe('MN new');
  });
});
