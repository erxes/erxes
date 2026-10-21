import { z } from 'zod';

// `messengerData` and `uiOptions` are stored JSON that the messenger widget
// reads too, so they stay JSON in the schema. Every leaf, list item and map
// entry falls back on its own: one malformed value never drops the rest of a
// messenger's setup.

const optionalString = z.string().optional().catch(undefined);
const optionalBoolean = z.boolean().optional().catch(undefined);

const lenientList = <Out, In>(item: z.ZodType<Out, z.ZodTypeDef, In>) =>
  z
    .array(z.unknown())
    .optional()
    .catch(undefined)
    .transform((list) =>
      list?.flatMap((value): Out[] => {
        const parsed = item.safeParse(value);

        return parsed.success ? [parsed.data] : [];
      }),
    );

const lenientRecord = <Out, In>(value: z.ZodType<Out, z.ZodTypeDef, In>) =>
  z
    .record(z.string(), z.unknown())
    .optional()
    .catch(undefined)
    .transform((record) => {
      if (!record) {
        return undefined;
      }

      const result: Record<string, Out> = {};

      for (const [key, entry] of Object.entries(record)) {
        const parsed = value.safeParse(entry);

        if (parsed.success) {
          result[key] = parsed.data;
        }
      }

      return result;
    });

const EM_MESSAGES_SCHEMA = z.object({
  greetings: z
    .object({
      title: optionalString,
      message: optionalString,
    })
    .optional()
    .catch(undefined),
  welcome: optionalString,
  away: optionalString,
  thank: optionalString,
});

export const EM_MESSENGER_DATA_SCHEMA = z
  .object({
    botShowInitialMessage: optionalBoolean,
    botCheck: optionalBoolean,
    botGreetMessage: optionalString,
    automationId: optionalString,
    persistentMenus: lenientList(
      z.object({
        name: optionalString,
        text: optionalString,
        type: optionalString,
        link: optionalString,
        contentType: optionalString,
      }),
    ),
    availabilityMethod: optionalString,
    isOnline: optionalBoolean,
    timezone: optionalString,
    responseRate: optionalString,
    showTimezone: optionalBoolean,
    onlineHours: lenientList(
      z.object({
        day: z.string().catch(''),
        from: optionalString,
        to: optionalString,
      }),
    ),
    supporterIds: lenientList(z.string()),
    messages: lenientRecord(EM_MESSAGES_SCHEMA),
    requireAuth: optionalBoolean,
    showChat: optionalBoolean,
    showLauncher: optionalBoolean,
    hideWhenOffline: optionalBoolean,
    forceLogoutWhenResolve: optionalBoolean,
    showVideoCallRequest: optionalBoolean,
    links: lenientRecord(z.string()),
    externalLinks: lenientList(z.object({ url: z.string() })),
    knowledgeBaseTopicId: optionalString,
  })
  .catch({});

export const EM_UI_OPTIONS_SCHEMA = z
  .object({
    logo: optionalString,
    launcherLogo: optionalString,
    primary: z
      .object({
        DEFAULT: optionalString,
        foreground: optionalString,
      })
      .optional()
      .catch(undefined),
    backgroundColor: optionalString,
    heroStyleVariant: z
      .enum(['glossy', 'aurora', 'mesh', 'flat'])
      .optional()
      .catch(undefined),
    navigationVariant: z.enum(['pill', 'fluid']).optional().catch(undefined),
    isSupportInAppView: optionalBoolean,
  })
  .catch({});

export type TEMMessengerData = z.output<typeof EM_MESSENGER_DATA_SCHEMA>;

export type TEMUiOptions = z.output<typeof EM_UI_OPTIONS_SCHEMA>;
