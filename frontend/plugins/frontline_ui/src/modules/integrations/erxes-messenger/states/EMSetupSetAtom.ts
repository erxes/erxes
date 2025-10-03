import { DEFAULT_LANGUAGE } from '@/integrations/erxes-messenger/constants/emStatesDefaultValues';
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
        brandColor: payload?.uiOptions?.color,
        textColor: payload?.uiOptions?.textColor,
        logo: payload?.uiOptions?.logo,
      };
      set(erxesMessengerSetupAppearanceAtom, appearance);

      // Set config
      const config = {
        name: payload?.name || '',
        brandId: payload?.brandId || '',
        languageCode: payload?.languageCode || DEFAULT_LANGUAGE,
        channelIds: payload?.channels?.map((channel) => channel._id) || [],
        botSetup: {
          greetingMessage: payload?.messengerData?.botGreetMessage,
          persistentMenus: payload?.messengerData?.persistentMenus,
          generate: payload?.messengerData?.botCheck,
        },
      };

      set(erxesMessengerSetupConfigAtom, config);

      // Set greeting with processed links
      const greetingLinks = processGreetingLinks(
        payload?.messengerData?.links,
        payload?.messengerData?.externalLinks,
      );

      const greetings = {
        supporterIds: payload?.messengerData?.supporterIds,
        title:
          (payload?.messengerData?.messages || {})[
            payload?.languageCode || DEFAULT_LANGUAGE
          ]?.greetings?.title || '',
        message:
          (payload?.messengerData?.messages || {})[
            payload?.languageCode || DEFAULT_LANGUAGE
          ]?.greetings?.message || '',
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
        languageCode: payload?.languageCode || DEFAULT_LANGUAGE,
        requireAuth: payload?.messengerData?.requireAuth ?? false,
        showChat: payload?.messengerData?.showChat ?? true,
        showLauncher: payload?.messengerData?.showLauncher ?? true,
        forceLogoutWhenResolve:
          payload?.messengerData?.forceLogoutWhenResolve ?? false,
        notifyCustomer: payload?.messengerData?.notifyCustomer ?? false,
        showVideoCallRequest:
          payload?.messengerData?.showVideoCallRequest ?? false,
      };
      // Set settings
      set(erxesMessengerSetupSettingsAtom, settings);

      // Set intro messages
      const messages = (payload?.messengerData?.messages || {})[
        payload?.languageCode || DEFAULT_LANGUAGE
      ];
      const intro = {
        welcome: messages?.welcome ?? '',
        away: messages?.away ?? '',
        thankyou: messages?.thank ?? '',
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
