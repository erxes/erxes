import { SOCIAL_PLATFORMS } from '@/integrations/erxes-messenger/constants/emStatesDefaultValues';
import {
  EMLink,
  MessengerSetupPayload,
  ProcessedLinks,
  SocialLinks,
} from '@/integrations/erxes-messenger/types/EMStateTypes';
import { Weekday } from '@/integrations/erxes-messenger/types/Weekday';
import { ScheduleDay } from '@/integrations/erxes-messenger/constants/emHoursSchema';
import { z } from 'zod';

/**
 * Normalizes hostname by removing www prefix
 */
export const normalizeHostname = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

/**
 * Processes links array to separate social links from external links
 */
export const processLinks = (links?: EMLink[]): ProcessedLinks => {
  const socialLinks: Partial<SocialLinks> = {};
  const externalLinks: EMLink[] = [];

  if (!links?.length) return { links: socialLinks, externalLinks };

  for (const link of links) {
    const hostname = normalizeHostname(link.url);
    const platform = hostname && SOCIAL_PLATFORMS[hostname];

    if (platform) {
      socialLinks[platform] = link.url;
    } else {
      externalLinks.push({ url: link.url });
    }
  }

  return { links: socialLinks, externalLinks };
};

/**
 * Creates default online hours structure
 */
export const createDefaultOnlineHours = () => {
  return Object.values(Weekday).reduce((acc, day) => {
    acc[day] = { from: '', to: '', work: false };
    return acc;
  }, {} as Record<Weekday, { from?: string; to?: string; work?: boolean }>);
};

const VALID_SCHEDULE_KEYS = new Set<string>([
  ...Object.values(Weekday),
  ...Object.values(ScheduleDay),
]);

export const processOnlineHours = (
  onlineHours?: Exclude<
    MessengerSetupPayload['messengerData'],
    undefined
  >['onlineHours'],
) => {
  return onlineHours?.reduce((acc, { day, from, to }) => {
    if (!VALID_SCHEDULE_KEYS.has(day)) return acc;
    acc[day] = { from: from ?? '', to: to ?? '', work: true };
    return acc;
  }, {} as Record<string, { from?: string; to?: string; work?: boolean }>);
};

/**
 * Validates and filters links for greeting setup
 */
export const processGreetingLinks = (
  links?: { [key: string]: string },
  externalLinks?: { url: string }[],
) => {
  const validLinks = Object.values(links || {})
    .filter((value) => z.string().url().safeParse(value).success)
    .map((value) => ({ url: value }));

  return [...validLinks, ...(externalLinks || [])];
};
