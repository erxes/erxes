import { Weekday } from '@/integrations/erxes-messenger/types/Weekday';

export interface EMLink {
  url: string;
}

export type SocialPlatform = 'youtube' | 'facebook' | 'instagram' | 'twitter';

export type SocialLinks = Record<SocialPlatform, string>;

export interface ProcessedLinks {
  links: Partial<SocialLinks>;
  externalLinks: EMLink[];
}

// Messenger setup payload type
export interface MessengerSetupPayload {
  _id: string;
  name?: string;
  brandId?: string;
  languageCode?: string;
  channels?: {
    _id: string;
  }[];
  messengerData?: {
    notifyCustomer?: boolean;
    botEndpointUrl?: string;
    botShowInitialMessage?: boolean;
    botCheck?: boolean;
    botGreetMessage?: string;
    persistentMenus?: {
      _id: string;
      name: string;
      type: string;
      url: string;
    }[];
    availabilityMethod?: 'manual' | 'auto';
    isOnline?: boolean;
    timezone?: string;
    responseRate?: string;
    showTimezone?: boolean;
    onlineHours?: {
      _id: string;
      day: Weekday;
      from: string;
      to: string;
    }[];
    supporterIds?: string[];
    messages?: {
      [key: string]: {
        greetings?: {
          title?: string;
          message?: string;
        };
        welcome?: string;
        away?: string;
        thank?: string;
      };
    };
    requireAuth?: boolean;
    showChat?: boolean;
    showLauncher?: boolean;
    hideWhenOffline?: boolean;
    forceLogoutWhenResolve?: boolean;
    showVideoCallRequest?: boolean;
    links?: { [key: string]: string };
    externalLinks?: { url: string }[];
  };
  callData?: {
    header?: string;
    description?: string;
    secondPageHeader?: string;
    secondPageDescription?: string;
    departments?: {
      _id: string;
      name: string;
      operators: string[];
    }[];
    isReceiveWebCall?: boolean;
  };
  uiOptions?: {
    color?: string;
    textColor?: string;
    wallpaper?: string;
    logo?: string;
  };
}
