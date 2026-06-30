import {
  DEFAULT_COLORS,
  DEFAULT_LANGUAGE,
} from '@/integrations/erxes-messenger/constants/emStatesDefaultValues';
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
import { MessengerSetupPayload } from '@/integrations/erxes-messenger/types/EMStateTypes';
import { EnumResponseRate } from '@/integrations/erxes-messenger/types/ResponseRate';
import {
  createDefaultOnlineHours,
  processGreetingLinks,
  processOnlineHours,
} from '@/integrations/erxes-messenger/utils/emStateUtils';
import { atom } from 'jotai';

/**
 * Atom for setting up messenger from existing configuration
 */
export const erxesMessengerSetSetupAtom = atom(
  null,
  (_, set, payload: MessengerSetupPayload) => {
    try {
      // Set appearance
      const appearance = {
        primary: {
          DEFAULT:
            payload?.uiOptions?.primary?.DEFAULT || DEFAULT_COLORS.PRIMARY,
          foreground:
            payload?.uiOptions?.primary?.foreground ||
            DEFAULT_COLORS.FOREGROUND,
        },
        logo: payload?.uiOptions?.logo,
        launcherLogo: payload?.uiOptions?.launcherLogo,
        backgroundColor:
          payload?.uiOptions?.backgroundColor || DEFAULT_COLORS.BACKGROUND,
        heroStyleVariant: payload?.uiOptions?.heroStyleVariant,
        navigationVariant: payload?.uiOptions?.navigationVariant,
      };
      set(erxesMessengerSetupAppearanceAtom, appearance);

      // Set config
      const channelId =
        payload?.channel?._id ||
        payload?.channels?.map((channel) => channel._id)?.[0] ||
        '';
      const config = {
        name: payload?.name || '',
        channelId,
        brandId: payload?.brandId,
        ticketConfigId: payload?.ticketConfigId,
        knowledgeBaseTopicId: payload?.messengerData?.knowledgeBaseTopicId,
        botSetup: {
          greetingMessage: payload?.messengerData?.botGreetMessage,
          persistentMenu: (payload?.messengerData?.persistentMenus || []).map(
            (menu: {
              _id?: string;
              name?: string;
              text?: string;
              type?: string;
              link?: string;
              contentType?: string;
            }) => ({
              text: menu.text ?? menu.name ?? '',
              type: (menu.type === 'link' ? 'link' : 'button') as
                | 'button'
                | 'link',
              link: menu.link ?? '',
              contentType: menu.contentType ?? 'text',
            }),
          ),
          botCheck: payload?.messengerData?.botCheck,
          botShowInitialMessage: payload?.messengerData?.botShowInitialMessage,
          automationId: payload?.messengerData?.automationId,
        },
      };

      set(erxesMessengerSetupConfigAtom, config);

      // Derive language code from messages object key first, then fall back to
      // payload.languageCode so format mismatches (e.g. "en_US" vs "en-US")
      // don't cause the lookup to miss the stored data.
      const messagesObj = payload?.messengerData?.messages;
      const languageCode =
        payload?.languageCode ||
        (messagesObj ? Object.keys(messagesObj)[0] : undefined) ||
        DEFAULT_LANGUAGE;

      // Set greeting with processed links
      const greetingLinks = processGreetingLinks(
        payload?.messengerData?.links,
        payload?.messengerData?.externalLinks,
      );

      const greetings = {
        supporterIds: payload?.messengerData?.supporterIds,
        title: messagesObj?.[languageCode]?.greetings?.title || '',
        message: messagesObj?.[languageCode]?.greetings?.message || '',
        links: greetingLinks,
      };

      set(erxesMessengerSetupGreetingAtom, greetings);

      // Set hours with improved processing
      const defaultHours = createDefaultOnlineHours();
      const processedHours = processOnlineHours(
        payload?.messengerData?.onlineHours,
      );

      const hours = {
        availabilityMethod:
          payload?.messengerData?.availabilityMethod || 'manual',
        responseRate: payload?.messengerData?.responseRate?.replace(
          'few ',
          '',
        ) as EnumResponseRate,
        isOnline: payload?.messengerData?.isOnline,
        onlineHours: {
          ...defaultHours,
          ...processedHours,
        },
        timezone: payload?.messengerData?.timezone,
        displayOperatorTimezone: payload?.messengerData?.showTimezone,
        hideMessengerDuringOfflineHours:
          payload?.messengerData?.hideWhenOffline,
      };

      set(erxesMessengerSetupHoursAtom, hours);

      const settings = {
        languageCode,
        requireAuth: payload?.messengerData?.requireAuth ?? false,
        showChat: payload?.messengerData?.showChat ?? true,
        showLauncher: payload?.messengerData?.showLauncher ?? true,
        forceLogoutWhenResolve:
          payload?.messengerData?.forceLogoutWhenResolve ?? false,
        notifyCustomer: payload?.messengerData?.notifyCustomer ?? false,
        showVideoCallRequest:
          payload?.messengerData?.showVideoCallRequest ?? false,
        websiteApps: (payload?.websiteMessengerApps ?? []).map((app) => ({
          _id: app._id,
          kind: app.kind ?? 'webstite',
          showInInbox: app.showInInbox ?? false,
          credentials: {
            integrationId: app.credentials?.integrationId ?? '',
            description: app.credentials?.description,
            buttonText: app.credentials?.buttonText,
            url: app.credentials?.url ?? '',
          },
          scopeBrandIds: [],
        })),
      };
      // Set settings
      set(erxesMessengerSetupSettingsAtom, settings);

      // Set intro messages
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
      // Optionally, you could throw the error or set an error state
    }
  },
);
