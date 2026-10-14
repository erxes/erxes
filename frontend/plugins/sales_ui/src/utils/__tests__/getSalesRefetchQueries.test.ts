import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  type WatchQueryFetchPolicy,
} from '@apollo/client';
import { parse } from 'graphql';
import { getSalesRefetchQueries } from '../getSalesRefetchQueries';

const groups: {
  group: Parameters<typeof getSalesRefetchQueries>[1];
  operations: string[];
}[] = [
  {
    group: 'Deals',
    operations: ['salesDealList', 'salesDealSearchDropdown'],
  },
  {
    group: 'SalesStages',
    operations: ['salesDealStages', 'salesDealConversionStages'],
  },
  {
    group: 'posList',
    operations: [
      'salesPosSettingsList',
      'salesPosNavigationList',
      'salesPosOrdersPosList',
      'salesPosByItemsPosList',
      'salesPosCoversPosList',
      'salesPosItemsPosList',
      'salesPosSummaryPosList',
    ],
  },
  {
    group: 'posDetail',
    operations: [
      'salesPosSettingsDetail',
      'salesPosOrdersInlineDetail',
      'salesPosOrdersSelectDetail',
      'salesPosCoversInlineDetail',
      'salesPosCoversSelectDetail',
      'salesPosItemsInlineDetail',
      'salesPosItemsSelectDetail',
      'salesPosSummaryInlineDetail',
      'salesPosSummarySelectDetail',
    ],
  },
];

const cleanups: (() => void)[] = [];

const createClient = () => {
  const requests: { name: string; marker: unknown }[] = [];
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          requests.push({
            name: operation.operationName,
            marker: operation.variables.marker,
          });
          observer.next({
            data:
              operation.operationName === 'salesRefetchTestMutation'
                ? { touch: true }
                : { probe: `${operation.variables.marker}:updated` },
          });
          observer.complete();
        }),
    ),
  });
  cleanups.push(() => client.stop());

  const watch = (
    name: string,
    marker: string,
    fetchPolicy: WatchQueryFetchPolicy = 'cache-first',
    subscribe = true,
  ) => {
    const query = parse(
      `query ${name}($marker: String!) { probe(marker: $marker) }`,
    );
    const variables = { marker };
    client.writeQuery({
      query,
      variables,
      data: { probe: `${marker}:initial` },
    });
    const observable = client.watchQuery({ query, variables, fetchPolicy });
    if (subscribe) {
      const subscription = observable.subscribe({ next: () => undefined });
      cleanups.push(() => subscription.unsubscribe());
    }
    return {
      marker,
      read: () =>
        client.readQuery<{ probe: string }>({ query, variables })?.probe,
    };
  };

  return { client, requests, watch };
};

afterEach(() => {
  cleanups
    .splice(0)
    .reverse()
    .forEach((cleanup) => cleanup());
  jest.restoreAllMocks();
});

test.each(groups)(
  '$group mutation refetches every renamed variant and legacy query with its variables',
  async ({ group, operations }) => {
    const warning = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const { client, requests, watch } = createClient();
    const expected = [
      watch(group, 'legacy'),
      ...operations.map((name) => watch(name, name)),
      watch(operations[0], 'second-variable-set'),
      watch(operations[0], 'without-observers', 'cache-first', false),
      watch(operations[0], 'cache-only', 'cache-only'),
    ];
    const standby = watch(operations[0], 'standby', 'standby');
    const unrelated = watch('salesRefetchUnrelated', 'unrelated');

    await client.mutate({
      mutation: parse('mutation salesRefetchTestMutation { touch }'),
      refetchQueries: () => getSalesRefetchQueries(client, group),
      awaitRefetchQueries: true,
    });

    expect(
      requests
        .filter(({ name }) => name !== 'salesRefetchTestMutation')
        .map(({ marker }) => marker)
        .sort(),
    ).toEqual(expected.map(({ marker }) => marker).sort());
    for (const query of expected) {
      expect(query.read()).toBe(`${query.marker}:updated`);
    }
    expect(standby.read()).toBe('standby:initial');
    expect(unrelated.read()).toBe('unrelated:initial');
    expect(warning).not.toHaveBeenCalled();
  },
);

test('subscription refetch includes both stage views and unchanged legacy stages', async () => {
  const { client, requests, watch } = createClient();
  const expected = [
    watch('salesDealStages', 'board'),
    watch('salesDealConversionStages', 'conversion'),
    watch('SalesStages', 'shared-selector'),
  ];
  watch('salesRefetchUnrelated', 'unrelated');

  await client.refetchQueries({
    include: getSalesRefetchQueries(client, 'SalesStages'),
  });

  expect(requests.map(({ marker }) => marker).sort()).toEqual(
    expected.map(({ marker }) => marker).sort(),
  );
  for (const query of expected) {
    expect(query.read()).toBe(`${query.marker}:updated`);
  }
});

test('absent and standby-only groups do not fetch or produce unknown-query warnings', async () => {
  const warning = jest
    .spyOn(console, 'warn')
    .mockImplementation(() => undefined);
  const { client, requests, watch } = createClient();
  watch('salesDealList', 'standby', 'standby');
  watch('salesRefetchUnrelated', 'unrelated');

  for (const { group } of groups) {
    const include = getSalesRefetchQueries(client, group);
    expect(include).toEqual([]);
    await client.refetchQueries({ include });
  }

  expect(requests).toEqual([]);
  expect(warning).not.toHaveBeenCalled();
});
