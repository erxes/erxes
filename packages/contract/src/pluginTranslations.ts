import { LANGUAGES } from '@erxes/core-db/enums';
import { z } from 'zod';

/** One text in a plugin's manifest or UI, as `translations` keys it. */
const PluginText = z.string().trim().min(1).max(300);

/**
 * A manifest's `translations`: the plugin's words core shows (its `title`, its record types'
 * titles, its activity types' and timelines' labels) in other languages. Per language (`mn`),
 * each English text and its translation
 * (`{ mn: { Sales: 'Борлуулалт', 'Deal created': 'Хэлцэл үүссэн' } }`). Web adds them to the
 * i18n namespace named for the plugin, where its UI's own words go too.
 */
export const PluginTranslations = z.partialRecord(
  z.enum(LANGUAGES),
  z
    .record(PluginText, PluginText)
    .refine((texts) => Object.keys(texts).length <= 2000, 'at most 2000 texts per language'),
);

export type PluginTranslations = z.infer<typeof PluginTranslations>;

/**
 * A plugin's notification in the reader's language, sent as its `data.text`. `title` and `body`
 * are the English text with its values left out (`Reservation {{number}} confirmed`): keys of the
 * manifest's `translations`. `values` fills them in. The notification's own `title` and `body`
 * stay ready to read in English, for email and for a reader that does not translate.
 */
export const NotificationText = z.object({
  title: PluginText,
  /** As long as a notification's own body may be; one past a translation's length reads in English. */
  body: z.string().trim().min(1).max(2000).optional(),
  values: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
});

export type NotificationText = z.infer<typeof NotificationText>;
