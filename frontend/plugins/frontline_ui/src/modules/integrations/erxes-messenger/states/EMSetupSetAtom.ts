import {
  DEFAULT_COLORS,
  DEFAULT_LANGUAGE,
} from '@/integrations/erxes-messenger/constants/emStatesDefaultValues';
import {
  createDefaultOnlineHours,
  processGreetingLinks,
  processOnlineHours,
} from '@/integrations/erxes-messenger/utils/emStateUtils';
import {
  erxesMessengerSetupAppearanceAtom,
  erxesMessengerSetupConfigAtom,
  erxesMessengerSetupGreetingAtom,
  erxesMessengerSetupHoursAtom,
  erxesMessengerSetupIntroAtom,
  erxesMessengerSetupSettingsAtom,
  erxesMessengerSetupStepAtom,
  settedIntegrationDetailAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';

import { EnumResponseRate } from '@/integrations/erxes-messenger/types/ResponseRate';
import { IEMIntegrationDetail } from '@/integrations/erxes-messenger/types/EMStateTypes';
import {
  EM_MESSENGER_DATA_SCHEMA,
  EM_UI_OPTIONS_SCHEMA,
} from '@/integrations/erxes-messenger/constants/emStoredDataSchema';
import { atom } from 'jotai';
import { isDefined } from 'erxes-ui';

/**
 * Atom for setting up messenger from existing configuration
 */
export const erxesMessengerSetSetupAtom = atom(
  null,
  (_, set, payload: IEMIntegrationDetail) => {
    try {
      const messengerData = EM_MESSENGER_DATA_SCHEMA.parse(
        payload.messengerData,
      );
      const uiOptions = EM_UI_OPTIONS_SCHEMA.parse(payload.uiOptions);

      const appearance = {
        primary: {
          DEFAULT: uiOptions.primary?.DEFAULT || DEFAULT_COLORS.PRIMARY,
          foreground:
            uiOptions.primary?.foreground || DEFAULT_COLORS.FOREGROUND,
        },
        logo: uiOptions.logo,
        launcherLogo: uiOptions.launcherLogo,
        backgroundColor: uiOptions.backgroundColor || DEFAULT_COLORS.BACKGROUND,
        heroStyleVariant: uiOptions.heroStyleVariant,
        navigationVariant: uiOptions.navigationVariant,
      };
      set(erxesMessengerSetupAppearanceAtom, appearance);

      // Set config
      const channelId = payload.channel?._id || '';
      const config = {
        name: payload.name || '',
        channelId,
        brandId: payload.brandId ?? '',
        ticketConfigIds: (payload.ticketConfigIds ?? []).filter(isDefined),
        knowledgeBaseTopicId: messengerData.knowledgeBaseTopicId,
        botSetup: {
          greetingMessage: messengerData.botGreetMessage,
          persistentMenu: (messengerData.persistentMenus || []).map((menu) => ({
            text: menu.text ?? menu.name ?? '',
            type: (menu.type === 'link' ? 'link' : 'button') as
              | 'button'
              | 'link',
            link: menu.link ?? '',
            contentType: menu.contentType ?? 'text',
          })),
          botCheck: messengerData.botCheck,
          botShowInitialMessage: messengerData.botShowInitialMessage,
          automationId: messengerData.automationId,
        },
      };

      set(erxesMessengerSetupConfigAtom, config);

      const messagesObj = messengerData.messages;
      const languageCode =
        payload.languageCode ||
        (messagesObj ? Object.keys(messagesObj)[0] : undefined) ||
        DEFAULT_LANGUAGE;

      // Set greeting with processed links
      const greetingLinks = processGreetingLinks(
        messengerData.links,
        messengerData.externalLinks,
      );

      const greetings = {
        supporterIds: messengerData.supporterIds,
        title: messagesObj?.[languageCode]?.greetings?.title || '',
        message: messagesObj?.[languageCode]?.greetings?.message || '',
        links: greetingLinks,
      };

      set(erxesMessengerSetupGreetingAtom, greetings);

      const defaultHours = createDefaultOnlineHours();
      const processedHours = processOnlineHours(messengerData.onlineHours);

      const rawResponseRate = messengerData.responseRate
        ?.replace('few ', '')
        ?.toLowerCase();
      const responseRate = (
        Object.values(EnumResponseRate) as string[]
      ).includes(rawResponseRate ?? '')
        ? (rawResponseRate as EnumResponseRate)
        : EnumResponseRate.MINUTES;

      const hours = {
        availabilityMethod: (messengerData.availabilityMethod === 'auto'
          ? 'auto'
          : 'manual') as 'auto' | 'manual',
        responseRate,
        isOnline: messengerData.isOnline ?? false,
        onlineHours: {
          ...defaultHours,
          ...processedHours,
        },
        timezone: messengerData.timezone ?? undefined,
        displayOperatorTimezone: messengerData.showTimezone ?? false,
        hideMessengerDuringOfflineHours: messengerData.hideWhenOffline ?? false,
      };

      set(erxesMessengerSetupHoursAtom, hours);

      const settings = {
        languageCode,
        requireAuth: messengerData.requireAuth ?? false,
        showChat: messengerData.showChat ?? true,
        showLauncher: messengerData.showLauncher ?? true,
        forceLogoutWhenResolve: messengerData.forceLogoutWhenResolve ?? false,
        showVideoCallRequest: messengerData.showVideoCallRequest ?? false,
        isSupportInAppView: uiOptions.isSupportInAppView ?? false,
        websiteApps: (payload.websiteMessengerApps ?? [])
          .filter(isDefined)
          .map((app) => ({
            _id: app._id ?? undefined,
            kind: app.kind ?? 'webstite',
            showInInbox: app.showInInbox ?? false,
            credentials: {
              integrationId: app.credentials?.integrationId ?? '',
              description: app.credentials?.description ?? undefined,
              buttonText: app.credentials?.buttonText ?? undefined,
              url: app.credentials?.url ?? '',
            },
            scopeBrandIds: [],
          })),
      };
      set(erxesMessengerSetupSettingsAtom, settings);

      const messages = messagesObj?.[languageCode];
      const intro = {
        welcome: messages?.welcome ?? '',
        away: messages?.away ?? '',
        thank: messages?.thank ?? '',
      };
      set(erxesMessengerSetupIntroAtom, intro);
      set(settedIntegrationDetailAtom, true);
      set(erxesMessengerSetupStepAtom, 1);
    } catch (error) {
      console.error('Error setting up messenger configuration:', error);
    }
  },
);
