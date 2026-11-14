import {
  ApolloClient,
  ApolloLink,
  execute,
  FetchResult,
  gql,
  Observable,
} from '@apollo/client';
import { toast } from 'erxes-ui';
import { IDataExtensionField, IDataExtensionRecordType } from '../types';
import {
  clearDataExtensionCreateValues,
  createDataExtensionsCreateLink,
  setDataExtensionCreateValues,
} from './createValues';

jest.mock('erxes-ui', () => ({ toast: jest.fn() }));
jest.mock('react-i18next', () => ({
  getI18n: () => ({ t: (key: string) => key }),
}));
jest.mock('./typedOperations', () => ({
  buildPatchMutation: () =>
    'mutation CompanyDataExtensionsPatch($_id: ID!, $values: JSON!) { companyDataExtensionsPatch(_id: $_id, values: $values) { _id } }',
  typedRequestOptions: {
    context: { uri: '/data-extensions/graphql' },
    fetchPolicy: 'no-cache',
  },
}));

const company: IDataExtensionRecordType = {
  recordType: 'core:company',
  label: 'Companies',
  typeName: 'Company',
  owner: 'core',
  contentTypes: ['core:company'],
  createMutations: ['companiesAdd'],
  fieldCount: 1,
};

const qwerty: IDataExtensionField = {
  _id: 'f1',
  recordType: 'core:company',
  key: 'qwerty',
  label: 'Qwerty',
  type: 'text',
  order: 0,
  status: 'active',
};

const COMPANIES_ADD = gql`
  mutation CompaniesAdd($primaryName: String) {
    companiesAdd(primaryName: $primaryName) {
      _id
    }
  }
`;

const TAGS_ADD = gql`
  mutation TagsAdd($name: String) {
    tagsAdd(name: $name) {
      _id
    }
  }
`;

const COMPANIES_QUERY = gql`
  query Companies {
    companies {
      _id
    }
  }
`;

/** Runs one operation through the link and a terminating link. */
const run = (
  link: ApolloLink,
  query: ReturnType<typeof gql>,
  data: FetchResult['data'],
  events: string[] = [],
) => {
  const terminating = new ApolloLink(
    () =>
      new Observable<FetchResult>((observer) => {
        observer.next({ data });
        observer.complete();
      }),
  );

  return new Promise<FetchResult>((resolve, reject) => {
    execute(ApolloLink.from([link, terminating]), { query }).subscribe({
      next: (result) => {
        events.push('result');
        resolve(result);
      },
      error: reject,
    });
  });
};

interface IPatchCall {
  variables: { _id: string; values: Record<string, unknown> };
  context?: { uri?: string };
  fetchPolicy?: string;
}

/** A client `mutate` whose calls are typed for the assertions below. */
const mockMutate = (
  impl: () => Promise<unknown> = async () => ({ data: {} }),
) => jest.fn<Promise<unknown>, [IPatchCall]>(impl);

const setup = (mutate: jest.Mock<Promise<unknown>, [IPatchCall]>) => {
  const client = { mutate } as unknown as ApolloClient<unknown>;

  return createDataExtensionsCreateLink(() => client);
};

const holdValues = (
  values: Record<string, string | null>,
  onSaved = jest.fn(),
) => {
  setDataExtensionCreateValues({
    recordType: company,
    fields: [qwerty],
    recordTypes: [company],
    values,
    onSaved,
  });

  return onSaved;
};

afterEach(() => {
  clearDataExtensionCreateValues('core:company');
  jest.clearAllMocks();
});

describe('createDataExtensionsCreateLink', () => {
  it('writes held values to the created record before passing the result on', async () => {
    const events: string[] = [];
    const mutate = mockMutate(async () => {
      events.push('patch');
      return { data: {} };
    });
    const onSaved = holdValues({ qwerty: 'hello' });

    const result = await run(
      setup(mutate),
      COMPANIES_ADD,
      { companiesAdd: { _id: 'c1' } },
      events,
    );

    expect(result.data).toEqual({ companiesAdd: { _id: 'c1' } });
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toMatchObject({
      variables: { _id: 'c1', values: { qwerty: 'hello' } },
      context: { uri: '/data-extensions/graphql' },
      fetchPolicy: 'no-cache',
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['patch', 'result']);
  });

  it('writes the values only once', async () => {
    const mutate = mockMutate();
    const link = setup(mutate);

    holdValues({ qwerty: 'hello' });
    await run(link, COMPANIES_ADD, { companiesAdd: { _id: 'c1' } });
    await run(link, COMPANIES_ADD, { companiesAdd: { _id: 'c2' } });

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('leaves values held for mutations that do not create the record type', async () => {
    const mutate = mockMutate();
    const link = setup(mutate);

    holdValues({ qwerty: 'hello' });
    await run(link, TAGS_ADD, { tagsAdd: { _id: 't1' } });
    expect(mutate).not.toHaveBeenCalled();

    await run(link, COMPANIES_ADD, { companiesAdd: { _id: 'c1' } });
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('does not hold empty values', async () => {
    const mutate = mockMutate();

    holdValues({ qwerty: '' });
    holdValues({ qwerty: null });
    await run(setup(mutate), COMPANIES_ADD, { companiesAdd: { _id: 'c1' } });

    expect(mutate).not.toHaveBeenCalled();
  });

  it('sends only filled values', async () => {
    const mutate = mockMutate();

    holdValues({ qwerty: 'hello', other: '' });
    await run(setup(mutate), COMPANIES_ADD, { companiesAdd: { _id: 'c1' } });

    expect(mutate.mock.calls[0][0].variables.values).toEqual({
      qwerty: 'hello',
    });
  });

  it('drops values cleared before the create', async () => {
    const mutate = mockMutate();

    holdValues({ qwerty: 'hello' });
    clearDataExtensionCreateValues('core:company');
    await run(setup(mutate), COMPANIES_ADD, { companiesAdd: { _id: 'c1' } });

    expect(mutate).not.toHaveBeenCalled();
  });

  it('ignores a create that returned no record', async () => {
    const mutate = mockMutate();
    const link = setup(mutate);

    holdValues({ qwerty: 'hello' });
    await run(link, COMPANIES_ADD, { companiesAdd: null });
    expect(mutate).not.toHaveBeenCalled();

    await run(link, COMPANIES_ADD, { companiesAdd: { _id: 'c1' } });
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('still passes the result on and warns when the write fails', async () => {
    const mutate = mockMutate(async () => {
      throw new Error('Unknown or inactive field "qwerty"');
    });
    const onSaved = holdValues({ qwerty: 'hello' });

    const result = await run(setup(mutate), COMPANIES_ADD, {
      companiesAdd: { _id: 'c1' },
    });

    expect(result.data).toEqual({ companiesAdd: { _id: 'c1' } });
    expect(onSaved).not.toHaveBeenCalled();
    // After the result, so the form's success toast cannot replace it.
    expect(toast).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve));
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        title: 'toast.created-values-failed',
        description: 'Unknown or inactive field "qwerty"',
      }),
    );
  });

  it('passes queries straight through', async () => {
    const mutate = mockMutate();

    holdValues({ qwerty: 'hello' });
    await run(setup(mutate), COMPANIES_QUERY, { companies: [{ _id: 'c1' }] });

    expect(mutate).not.toHaveBeenCalled();
  });
});
