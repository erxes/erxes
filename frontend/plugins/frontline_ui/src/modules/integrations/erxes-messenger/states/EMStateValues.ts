import { atom } from 'jotai';
import {
  erxesMessengerSetupAppearanceAtom,
  erxesMessengerSetupGreetingAtom,
  erxesMessengerSetupHoursAtom,
  erxesMessengerSetupIntroAtom,
  erxesMessengerSetupSettingsAtom,
} from './erxesMessengerSetupStates';
import { processLinks } from '@/integrations/erxes-messenger/utils/emStateUtils';
import { z } from 'zod';
import { EM_CONFIG_SCHEMA } from '@/integrations/erxes-messenger/constants/emConfigSchema';
import {
  DEFAULT_COLORS,
  DEFAULT_LANGUAGE,
} from '@/integrations/erxes-messenger/constants/emStatesDefaultValues';
import { EnumResponseRate } from '@/integrations/erxes-messenger/types/ResponseRate';
import { Weekday } from '@/integrations/erxes-messenger/types/Weekday';

/**
 * Atom that generates the messenger creation payload
 */
export const erxesMessengerSetupValuesAtom = atom((get) => {
  const appearance = get(erxesMessengerSetupAppearanceAtom);
  const greeting = get(erxesMessengerSetupGreetingAtom);
  const intro = get(erxesMessengerSetupIntroAtom);
  const hours = get(erxesMessengerSetupHoursAtom);
  const settings = get(erxesMessengerSetupSettingsAtom);
  const { links, externalLinks } = processLinks(greeting?.links);

  return (config: z.infer<typeof EM_CONFIG_SCHEMA>) => ({
    createVariables: {
      name: config?.name,
      channelId: config?.channelId,
      brandId: config?.brandId,
      ticketConfigId: config?.ticketConfigId,
      languageCode: settings?.languageCode || DEFAULT_LANGUAGE,
    },
    saveConfigVariables: {
      messengerData: {
        notifyCustomer: settings?.notifyCustomer ?? false,
        botEndpointUrl: '',
        botShowInitialMessage: config?.botSetup?.botShowInitialMessage ?? false,
        botCheck: config?.botSetup?.botCheck ?? false,
        botGreetMessage: config?.botSetup?.greetingMessage ?? '',
        automationId: config?.botSetup?.automationId ?? '',
        persistentMenus:
          config?.botSetup?.persistentMenu?.map((item) => ({
            text: item.text,
            type: item.type,
            link: item.link,
            contentType: item.contentType,
          })) ?? [],
        availabilityMethod: hours?.availabilityMethod || 'manual',
        isOnline: hours?.isOnline ?? false,
        timezone: hours?.timezone || '',
        responseRate: hours?.responseRate || EnumResponseRate.MINUTES,
        showTimezone: hours?.displayOperatorTimezone ?? false,
        onlineHours: Object.entries(hours?.onlineHours || {})
          .filter(([_, hour]) => hour.work)
          .map(([day, { work, ...value }]) => ({
            _id: day,
            day: day as Weekday,
            ...value,
          })),
        supporterIds: greeting?.supporterIds || [],
        messages: {
          [settings?.languageCode || DEFAULT_LANGUAGE]: {
            greetings: {
              title: greeting?.title || '',
              message: greeting?.message || '',
            },
            welcome: intro?.welcome || '',
            away: intro?.away || '',
            thank: intro?.thank || '',
          },
        },
        requireAuth: settings?.requireAuth ?? false,
        showChat: settings?.showChat ?? true,
        showLauncher: settings?.showLauncher ?? true,
        hideWhenOffline: false,
        forceLogoutWhenResolve: settings?.forceLogoutWhenResolve ?? false,
        showVideoCallRequest: settings?.showVideoCallRequest ?? false,
        links,
        externalLinks,
        knowledgeBaseTopicId: config?.knowledgeBaseTopicId ?? '',
        websiteApps: settings?.websiteApps ?? [],
      },
      callData: {},
    },
    uiOptions: {
      primary: {
        DEFAULT: appearance?.primary?.DEFAULT || DEFAULT_COLORS.PRIMARY,
        foreground:
          appearance?.primary?.foreground || DEFAULT_COLORS.FOREGROUND,
      },
      logo: appearance?.logo || '',
      launcherLogo: appearance?.launcherLogo || '',
      backgroundColor: appearance?.backgroundColor || DEFAULT_COLORS.BACKGROUND,
      heroStyleVariant: appearance?.heroStyleVariant || 'glossy',
      navigationVariant: appearance?.navigationVariant || 'pill',
    },
  });
});
