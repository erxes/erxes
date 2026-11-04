import { aiAgentActionConfigSchema } from './aiAgentActionConfigSchema';
import {
  delayActionConfigSchema,
  findObjectActionConfigSchema,
  ifActionConfigSchema,
  outgoingWebhookActionConfigSchema,
  sendEmailActionConfigSchema,
  setPropertyActionConfigSchema,
  splitActionConfigSchema,
  waitEventActionConfigSchema,
} from './coreActionConfigSchemas';
import { toTransportConfigSchema } from './configSchema';

const issuePaths = (result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[] }[] };
}) => (result.error?.issues || []).map(({ path }) => path.join('.'));

describe('delayActionConfigSchema', () => {
  it('accepts the amount as the builder stores it, or as a number', () => {
    expect(
      delayActionConfigSchema.safeParse({ value: '5', type: 'day' }).success,
    ).toBe(true);
    expect(
      delayActionConfigSchema.safeParse({ value: 2, type: 'hour' }).success,
    ).toBe(true);
  });

  it('refuses what the executor cannot schedule', () => {
    expect(
      issuePaths(delayActionConfigSchema.safeParse({ value: '5' })),
    ).toEqual(['type']);
    expect(
      issuePaths(
        delayActionConfigSchema.safeParse({ value: 'soon', type: 'day' }),
      ),
    ).toEqual(['value']);
  });

  it('publishes both fields as required, with their meaning', () => {
    expect(toTransportConfigSchema(delayActionConfigSchema)).toMatchObject({
      required: ['value', 'type'],
      properties: {
        value: { description: expect.stringContaining('`type` units') },
        type: { enum: ['minute', 'hour', 'day', 'month', 'year'] },
      },
    });
  });
});

describe('sendEmailActionConfigSchema', () => {
  const builderConfig = {
    type: 'default',
    sender: 'erxes',
    fromEmailPlaceHolder: '',
    replyToEmail: '',
    toEmailsPlaceHolders: '{{ customer.email }}',
    ccEmailsPlaceHolders: '',
    subject: 'Thank you',
    content: '',
    contentJson: { type: 'doc' },
    contentFormat: 'maily',
    html: '<p>Hi</p>',
  };

  it('accepts a config the builder writes, form-only fields included', () => {
    expect(sendEmailActionConfigSchema.safeParse(builderConfig).success).toBe(
      true,
    );
  });

  it('refuses a mail the executor would fail to send', () => {
    expect(
      issuePaths(
        sendEmailActionConfigSchema.safeParse({
          ...builderConfig,
          subject: '   ',
          toEmailsPlaceHolders: '',
        }),
      ),
    ).toEqual(['toEmailsPlaceHolders', 'subject']);
  });

  it('needs a sender address only when the sender is picked', () => {
    expect(
      sendEmailActionConfigSchema.safeParse({
        ...builderConfig,
        type: undefined,
      }).success,
    ).toBe(true);
    expect(
      issuePaths(
        sendEmailActionConfigSchema.safeParse({
          ...builderConfig,
          type: 'custom',
        }),
      ),
    ).toEqual(['fromEmailPlaceHolder']);
  });
});

describe('outgoingWebhookActionConfigSchema', () => {
  const builderConfig = {
    method: 'POST',
    url: 'https://example.com/hooks/{{ trigger._id }}',
    queryParams: [],
    bodyMode: 'json',
    body: '{"dealId": "{{ trigger._id }}"}',
    headers: [{ key: 'X-Source', value: 'erxes' }],
    auth: { type: 'none' },
    options: {
      continueOnHttpError: false,
      timeout: '10000',
      ignoreSSL: false,
      followRedirect: true,
      maxRedirects: 5,
      retry: { attempts: 0, delay: 1000, backoff: 'none' },
    },
  };

  it('accepts a config the builder writes', () => {
    expect(
      outgoingWebhookActionConfigSchema.safeParse(builderConfig).success,
    ).toBe(true);
  });

  it('refuses a json body the executor cannot parse', () => {
    expect(
      issuePaths(
        outgoingWebhookActionConfigSchema.safeParse({
          ...builderConfig,
          body: '{"amount": {{ trigger.amount }}}',
        }),
      ),
    ).toEqual(['body']);
    expect(
      outgoingWebhookActionConfigSchema.safeParse({
        ...builderConfig,
        bodyMode: 'text',
        body: 'amount={{ trigger.amount }}',
      }).success,
    ).toBe(true);
  });

  it('refuses a request without a url or a jwt without its key', () => {
    expect(
      issuePaths(
        outgoingWebhookActionConfigSchema.safeParse({
          ...builderConfig,
          url: '',
          auth: { type: 'jwt', algorithm: 'HS256', secretKey: '' },
        }),
      ),
    ).toEqual(['url', 'auth.secretKey']);
  });
});

describe('branching actions', () => {
  it('reads an if condition from its segment and branches by node id', () => {
    expect(
      ifActionConfigSchema.safeParse({ contentId: 'seg1', yes: 'a2', no: 'a3' })
        .success,
    ).toBe(true);
    expect(issuePaths(ifActionConfigSchema.safeParse({ yes: 'a2' }))).toEqual([
      'contentId',
    ]);
  });

  it('needs split options, each matched by a segment or conditions', () => {
    expect(
      splitActionConfigSchema.safeParse({
        options: [
          { id: 'o1', label: 'VIP', segmentId: 'seg1' },
          {
            id: 'o2',
            label: 'Big order',
            config: {
              conditionsConjunction: 'and',
              conditions: [
                {
                  propertyType: 'sales:sales.deals',
                  propertyName: 'amount',
                  propertyOperator: 'numberigt',
                  propertyValue: 1000,
                },
              ],
            },
          },
        ],
        optionalConnects: [{ optionalConnectId: 'fallback', actionId: 'a9' }],
      }).success,
    ).toBe(true);
    expect(
      issuePaths(
        splitActionConfigSchema.safeParse({
          options: [
            {
              id: 'o1',
              config: {
                conditions: [
                  { propertyName: 'amount', propertyOperator: 'gt' },
                ],
              },
            },
          ],
        }),
      ),
    ).toEqual(['options.0.config.conditions.0.propertyOperator']);
  });

  it('needs what find object looks up', () => {
    expect(
      issuePaths(
        findObjectActionConfigSchema.safeParse({
          objectType: 'core:contacts.customers',
          value: '{{ trigger.email }}',
        }),
      ),
    ).toEqual(['lookupField']);
  });

  it('waits on a segment unless it waits for a webhook', () => {
    expect(
      issuePaths(
        waitEventActionConfigSchema.safeParse({
          targetType: 'trigger',
          targetTypeId: 't1',
        }),
      ),
    ).toEqual(['segmentId']);
    expect(
      waitEventActionConfigSchema.safeParse({
        targetType: 'custom',
        targetTypeId: 't1',
      }).success,
    ).toBe(true);
  });

  it('changes properties only with rules it knows', () => {
    expect(
      issuePaths(
        setPropertyActionConfigSchema.safeParse({
          module: 'core:contacts.customers',
          rules: [{ field: 'state', operator: 'replace', value: 'customer' }],
        }),
      ),
    ).toEqual(['rules.0.operator']);
  });
});

describe('aiAgentActionConfigSchema', () => {
  it('fills the defaults the engine runs with', () => {
    expect(
      aiAgentActionConfigSchema.parse({
        aiAgentId: 'agent1',
        goalType: 'splitTopic',
        topics: [{ id: 'buy', topicName: 'Purchase' }],
      }),
    ).toMatchObject({
      topics: [{ id: 'buy', topicName: 'Purchase', prompt: '' }],
      optionalConnects: [],
      memory: { read: { enabled: false }, write: { key: 'lastResult' } },
    });
  });

  it('needs an agent and what the goal requires', () => {
    expect(
      issuePaths(
        aiAgentActionConfigSchema.safeParse({
          goalType: 'classification',
          objectFields: [],
        }),
      ),
    ).toEqual(['objectFields', 'aiAgentId']);
  });

  it('publishes where a topic branch is linked', () => {
    expect(
      JSON.stringify(toTransportConfigSchema(aiAgentActionConfigSchema)),
    ).toContain('optionalConnectId is a topic id');
  });
});
