import type { Notification } from '@erxes/core-contract';
import { NotificationText } from '@erxes/core-contract/pluginTranslations';
import { useTranslation } from 'react-i18next';

type Shown = Pick<Notification, 'source' | 'kind' | 'title' | 'body' | 'data'>;

/**
 * A notification's title and body in the member's language. Core's own kinds are translated by
 * kind, their bodies filled from `data`. A plugin's are translated when it sent `data.text`: its
 * English text is looked up in the plugin's namespace, where its manifest's `translations` are,
 * and takes the values it came with. Without `data.text` a plugin's notification reads as sent.
 */
export const useNotificationText = () => {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'notifications' });
  const { t: plugin } = useTranslation(undefined, { bindI18nStore: 'added' });

  return (notification: Shown) => {
    if (notification.source === 'core') {
      // Only a kind with a translated body: another's (a note's text) is never read as a template.
      const translated =
        notification.body &&
        i18n.exists(`notifications.bodies.${notification.kind}`, { ns: 'common' });

      return {
        title: t(`kinds.${notification.kind}`, notification.title),
        body: translated
          ? t(`bodies.${notification.kind}`, {
              ...notification.data,
              defaultValue: notification.body,
            })
          : notification.body,
      };
    }

    const text = NotificationText.safeParse(notification.data.text);

    if (!text.success) return { title: notification.title, body: notification.body };

    const said = (words: string) =>
      plugin(words, {
        // As `replace`, so a value named `ns` or `lng` fills its place and is never an option.
        replace: text.data.values,
        ns: notification.source,
        defaultValue: words,
        nsSeparator: false,
        keySeparator: false,
      });

    return {
      title: said(text.data.title),
      body: text.data.body ? said(text.data.body) : notification.body,
    };
  };
};
