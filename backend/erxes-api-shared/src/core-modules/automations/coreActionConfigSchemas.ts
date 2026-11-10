import { z } from 'zod/v4';
import {
  automationOptionalConnectsSchema,
  builderOnlyConfigField,
  describeConfigField as described,
} from './configSchema';
import { AUTOMATION_PROPERTY_OPERATORS } from './constants';

/**
 * Config contracts of the engine's own actions. They encode what the
 * executors in the automations service refuse or misbehave on, not what the
 * builder form requires, so a config the engine runs today stays valid.
 */

const requiredText = (description: string) =>
  described(z.string().trim().min(1), description);

const count = z.coerce.number().int().nonnegative();

export const delayActionConfigSchema = z.object({
  value: described(
    z.union([z.number().nonnegative(), z.string().regex(/^\d+(\.\d+)?$/)]),
    'How long to wait, counted in `type` units: a number or its digits.',
  ),
  type: z.enum(['minute', 'hour', 'day', 'month', 'year']),
  workingTime: described(
    z.boolean(),
    "Count only working hours (minutes, hours), or land on the next working moment (days and longer; 0 waits only for opening). Hours come from the record's branch, else branchId.",
  ).optional(),
  branchId: described(
    z.string(),
    '_id of the branch whose working hours apply when the record names none.',
  ).optional(),
});

const isBlocksText = (value: string) => {
  try {
    return Array.isArray(JSON.parse(value));
  } catch {
    return false;
  }
};

export const sendEmailActionConfigSchema = z
  .object({
    type: described(
      z.enum(['default', 'verified', 'custom']),
      'Sender. default (or absent) sends from the workspace address; verified and custom send from fromEmailPlaceHolder.',
    ).optional(),
    sender: described(z.string(), 'Sender display name.').optional(),
    fromEmailPlaceHolder: described(
      z.string(),
      "Sender address, or a {{ }} placeholder that resolves to one. Required unless type is default. A typed address must be on a verified domain or a verified sender; a placeholder must resolve to a team member's email or a verified sender. While emailSenderOptions.alignedFrom is set it holds the verified reply-to sender instead.",
    ).optional(),
    toEmailsPlaceHolders: requiredText(
      'Recipients: comma-separated addresses and/or {{ }} placeholders.',
    ),
    ccEmailsPlaceHolders: described(
      z.string(),
      'Cc recipients, same format as toEmailsPlaceHolders.',
    ).optional(),
    replyToEmail: described(
      z.string(),
      'Reply-to address: a verified sender from emailSenderOptions. Optional: without it replies go to the From. Unused while emailSenderOptions.alignedFrom is set.',
    ).optional(),
    subject: requiredText('Subject; {{ }} placeholders allowed.'),
    html: described(
      z.string(),
      'Rendered body kept for older steps; the builder shows content, so write content instead.',
    ).optional(),
    content: described(
      z.string(),
      'Body for contentFormat "blocks": a JSON array of blocks as text, e.g. [{"type":"paragraph","content":[{"type":"text","text":"Hi {{ firstName }}","styles":{}}]}]; headings use {"type":"heading","props":{"level":2}}, lists "bulletListItem". {{ }} variables in text are stored as fields.',
    ).optional(),
    contentJson: described(
      z.unknown(),
      'Email editor document for contentFormat "maily"; use blocks content instead when writing a body.',
    ).optional(),
    contentFormat: described(
      z.enum(['blocks', 'maily']),
      'Which editor the body belongs to: "blocks" reads content, "maily" reads contentJson.',
    ).optional(),
  })
  .refine(
    ({ contentFormat, contentJson }) =>
      contentFormat !== 'maily' || contentJson !== undefined,
    {
      path: ['contentJson'],
      message:
        'The email editor opens empty without contentJson; write content as blocks',
    },
  )
  .refine(
    ({ contentFormat, content }) =>
      contentFormat !== 'blocks' || !content || isBlocksText(content),
    {
      path: ['content'],
      message: 'Must be a JSON array of blocks',
    },
  )
  .refine(
    ({ type, fromEmailPlaceHolder }) =>
      (type ?? 'default') === 'default' || !!fromEmailPlaceHolder?.trim(),
    {
      path: ['fromEmailPlaceHolder'],
      message: 'Required when type is verified or custom',
    },
  );

const scalar = z.union([z.string(), z.number(), z.boolean()]);

const outgoingWebhookAuthSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('none') }),
  z.object({
    type: z.literal('basic'),
    username: z.string(),
    password: z.string(),
  }),
  z.object({ type: z.literal('bearer'), token: z.string() }),
  z.object({
    type: z.literal('jwt'),
    algorithm: z.string().min(1),
    secretKey: z.string().min(1),
    publicKey: z.string().optional(),
    claims: z.record(z.string(), scalar).optional(),
    expiresIn: z.string().optional(),
    audience: z.string().optional(),
    issuer: z.string().optional(),
    header: z.record(z.string(), scalar).optional(),
    placement: z.enum(['header', 'query', 'body']).optional(),
  }),
]);

const isJsonText = (value: string) => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const outgoingWebhookActionConfigSchema = z
  .object({
    method: z
      .enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
      .optional(),
    url: requiredText('Request url; {{ }} placeholders allowed.'),
    queryParams: z
      .array(z.object({ name: z.string(), value: z.string() }))
      .optional(),
    bodyMode: z.enum(['json', 'text']).optional(),
    body: described(
      z.string(),
      'Request body. In json mode a JSON object as text, parsed before placeholders are filled, so keep {{ }} inside string values.',
    ).optional(),
    auth: builderOnlyConfigField(
      outgoingWebhookAuthSchema,
      'Credentials of the request, set in the builder.',
    ).optional(),
    headers: z
      .array(z.object({ key: z.string(), value: z.string() }))
      .optional(),
    options: z
      .object({
        continueOnHttpError: z.boolean().optional(),
        timeout: count.optional(),
        ignoreSSL: z.boolean().optional(),
        followRedirect: z.boolean().optional(),
        maxRedirects: count.optional(),
        retry: z
          .object({
            attempts: count.optional(),
            delay: count.optional(),
            backoff: z
              .enum(['none', 'fixed', 'exponential', 'jitter'])
              .optional(),
          })
          .optional(),
        proxy: z
          .object({
            host: z.string().optional(),
            port: count.optional(),
            auth: builderOnlyConfigField(
              z.object({
                username: z.string().optional(),
                password: z.string().optional(),
              }),
              'Proxy credentials, set in the builder.',
            ).optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .refine(
    ({ bodyMode, body }) => bodyMode === 'text' || !body || isJsonText(body),
    { path: ['body'], message: 'Must be valid JSON in json body mode' },
  );

const nextAction = (when: string) =>
  described(z.string(), `id of the action run ${when}.`).optional();

const optionalConnects = (description: string) =>
  described(automationOptionalConnectsSchema, description).optional();

const contentType = (description: string) =>
  requiredText(`${description} A "plugin:module.collection" type.`);

export const ifActionConfigSchema = z.object({
  contentId: requiredText(
    '_id of the segment the target is tested against. Write the condition as a segment this automation owns: segmentsAdd(contentType, root, ownedBy: "automation").',
  ),
  yes: nextAction('when the target is in the segment'),
  no: nextAction('when it is not'),
});

const CONDITION_OPERATORS = [
  'e',
  'dne',
  'c',
  'dnc',
  'it',
  'if',
  'is',
  'ins',
  'numbere',
  'numberdne',
  'numberigt',
  'numberilt',
  'dateis',
  'dateins',
  'dateigt',
  'dateilt',
] as const;

export const splitActionConfigSchema = z.object({
  options: described(
    z
      .array(
        z.object({
          id: requiredText('Option id, the optionalConnectId of its branch.'),
          label: z.string().optional(),
          segmentId: described(
            z.string(),
            'Segment the target must be in; when set, conditions are not read.',
          ).optional(),
          config: z
            .object({
              conditionsConjunction: z.enum(['and', 'or']).optional(),
              conditions: z
                .array(
                  z.object({
                    propertyType: described(
                      z.string(),
                      'Type the property belongs to, as the builder lists it.',
                    ).optional(),
                    propertyName: requiredText(
                      'Path of the compared value in the target, or in the result of the targetActionId action.',
                    ),
                    propertyOperator: described(
                      z.enum(CONDITION_OPERATORS),
                      'is/ins (set or empty) and it/if (true/false) take no value; number* and date* compare numbers and dates.',
                    ),
                    propertyValue: z.unknown().optional(),
                  }),
                )
                .optional(),
            })
            .optional(),
        }),
      )
      .min(1),
    'Options tried in order; the first that matches takes its branch, none takes the fallback.',
  ),
  optionalConnects: optionalConnects(
    'Branch links: optionalConnectId is an option id, or "fallback" when no option matches; actionId is the next action.',
  ),
});

export const findObjectActionConfigSchema = z.object({
  objectType: contentType('What to look for, e.g. core:contacts.customers.'),
  lookupField: requiredText('Field matched against value, e.g. primaryEmail.'),
  value: described(z.string(), 'Value looked up; {{ }} placeholders allowed.'),
  isExists: nextAction('when a record is found'),
  notExists: nextAction('when none is found'),
});

export const transformActionConfigSchema = z.object({
  mappings: described(
    z
      .array(
        z.object({
          key: requiredText('Output key; a dotted path builds nested data.'),
          value: z.unknown().optional(),
          type: z
            .enum(['text', 'number', 'boolean', 'object', 'array'])
            .optional(),
          isExpression: described(
            z.boolean(),
            'Read value as an expression instead of a literal.',
          ).optional(),
        }),
      )
      .min(1),
    'Values the action outputs, each under its key.',
  ),
});

export const setPropertyActionConfigSchema = z.object({
  module: contentType(
    'Type of the record changed; candidates come from automationSetPropertyTargets(sourceType: the trigger type).',
  ),
  setPropertyTarget: z
    .object({
      label: z.string().optional(),
      type: z.string().optional(),
      source: z
        .enum(['target', 'relation', 'resolver', 'targetField'])
        .optional(),
      cardinality: z.enum(['one', 'many']).optional(),
      sourceType: z.string().optional(),
      relation: z
        .object({ contentType: z.string(), relatedContentType: z.string() })
        .partial()
        .optional(),
      resolverKey: z.string().optional(),
      targetPath: z.string().optional(),
      pluginName: z.string().optional(),
      value: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  targetTriggerId: z.string().optional(),
  targetActionId: z.string().optional(),
  rules: described(
    z
      .array(
        z.object({
          field: requiredText('Field of module that is changed.'),
          fieldLabel: z.string().optional(),
          operator: z.enum(AUTOMATION_PROPERTY_OPERATORS.ALL).optional(),
          value: described(
            z.unknown(),
            'New value or operand; {{ }} placeholders allowed.',
          ).optional(),
          fallbackValue: z.string().optional(),
          isExpression: z.boolean().optional(),
          meta: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .min(1),
    'Changes applied in order; operator defaults to set.',
  ),
});

export const messageProActionConfigSchema = z.object({
  documentId: requiredText('_id of the document rendered and sent.'),
  contentType: z.string().optional(),
});

export const waitEventActionConfigSchema = z
  .object({
    targetType: described(
      z.enum(['trigger', 'action', 'custom']),
      "trigger and action wait until that node's record enters segmentId; custom waits for a webhook call.",
    ),
    targetTypeId: requiredText('id of the trigger or action waited on.'),
    segmentId: z.string().optional(),
    webhookConfig: z.record(z.string(), z.unknown()).optional(),
    timeout: described(
      z.object({
        value: z.union([z.number(), z.string()]),
        unit: z.enum(['minutes', 'hours', 'days']),
      }),
      'Longest wait, at most 30 days; then the step ends with outcome timedOut. No timeout waits until the event.',
    ).optional(),
    met: nextAction(
      'when the event happens, on a node with a timeout; the node\'s nextActionId otherwise',
    ),
    timedOut: nextAction(
      'when the wait times out; without it the flow continues on the main path',
    ),
  })
  .refine(
    ({ targetType, segmentId }) =>
      targetType === 'custom' || !!segmentId?.trim(),
    {
      path: ['segmentId'],
      message: 'Required when waiting on a trigger or action',
    },
  );

export const WAIT_EVENT_MAX_TIMEOUT_MINUTES = 30 * 24 * 60;

const WAIT_EVENT_UNIT_MINUTES = { minutes: 1, hours: 60, days: 24 * 60 } as const;

/** Minutes a wait may last, or undefined when it waits until the event. */
export const readWaitEventTimeoutMinutes = (timeout: unknown) => {
  if (!timeout || typeof timeout !== 'object') {
    return undefined;
  }

  const { value, unit } = timeout as { value?: unknown; unit?: unknown };
  const amount = Number(value);
  const unitMinutes =
    WAIT_EVENT_UNIT_MINUTES[unit as keyof typeof WAIT_EVENT_UNIT_MINUTES];

  if (!unitMinutes || !Number.isFinite(amount) || amount <= 0) {
    return undefined;
  }

  return Math.min(amount * unitMinutes, WAIT_EVENT_MAX_TIMEOUT_MINUTES);
};

export const sendNotificationActionConfigSchema = z.object({
  userIds: requiredText(
    'Team member _ids notified, comma-separated, or a {{ }} variable, as text.',
  ),
  title: requiredText('Notification title; {{ }} placeholders allowed.'),
  message: described(
    z.string(),
    'Notification body; {{ }} placeholders allowed.',
  ).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export const APPROVAL_DEFAULT_TIMEOUT_HOURS = 72;
export const APPROVAL_MAX_TIMEOUT_HOURS = 30 * 24;

export const approvalActionConfigSchema = z.object({
  approverIds: requiredText(
    'Team member _ids who may approve, comma-separated, or a {{ }} variable, as text. The first decision wins.',
  ),
  summary: requiredText(
    'What is asked to be approved; {{ }} placeholders allowed.',
  ),
  timeoutHours: described(
    z.union([z.number(), z.string()]),
    'Hours to wait for a decision; 72 when absent, at most 30 days. On timeout the flow takes rejected with decision expired.',
  ).optional(),
  approved: nextAction('when approved'),
  rejected: nextAction('when rejected or expired'),
});

export const pickMemberActionConfigSchema = z.object({
  candidateIds: requiredText(
    'Team member _ids to choose from, comma-separated, or a {{ }} variable, as text. Inactive and unavailable members are left out.',
  ),
  method: described(
    z.enum(['roundRobin', 'random']),
    'How one member is chosen among the available: roundRobin (default) takes turns, random picks any.',
  ).optional(),
  fallbackUserId: described(
    z.string(),
    'Team member _id picked when nobody is available; the step skips when absent.',
  ).optional(),
});

export type TPickMemberActionConfig = z.infer<typeof pickMemberActionConfigSchema>;

export type TApprovalActionConfig = z.infer<typeof approvalActionConfigSchema>;

export type TDelayActionConfig = z.infer<typeof delayActionConfigSchema>;
export type TSendNotificationActionConfig = z.infer<
  typeof sendNotificationActionConfigSchema
>;
export type TSendEmailActionConfig = z.infer<
  typeof sendEmailActionConfigSchema
>;
export type TOutgoingWebhookActionConfig = z.infer<
  typeof outgoingWebhookActionConfigSchema
>;
