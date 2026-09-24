import type { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { debugFacebook } from '@/integrations/facebook/debuggers';
import {
  getPageAccessTokenFromMap,
  graphRequest,
} from '@/integrations/facebook/utils';
import { getErrorMessage } from '@/integrations/utils';

export const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

type TGraphMessageAttachment = {
  file_url?: string;
  image_data?: { url?: string; preview_url?: string };
  video_data?: { url?: string; preview_url?: string };
};

type TGraphMessageDetails = {
  attachments?: { data?: TGraphMessageAttachment[] };
};

export const fetchStoryMediaUrl = async (
  integration: IFacebookIntegrationDocument,
  pageId: string,
  mid: string,
) => {
  const pageToken = getPageAccessTokenFromMap(
    pageId,
    integration.facebookPageTokensMap || {},
  );
  if (!pageToken) {
    debugFacebook(`Cannot fetch story media without a page token: ${pageId}`);
    return undefined;
  }

  try {
    const details = (await graphRequest.get(
      `/${encodeURIComponent(
        mid,
      )}?fields=attachments.limit(10){file_url,image_data,video_data}`,
      pageToken,
    )) as TGraphMessageDetails;
    const attachment = details.attachments?.data?.[0];

    return (
      attachment?.image_data?.url ||
      attachment?.image_data?.preview_url ||
      attachment?.video_data?.url ||
      attachment?.video_data?.preview_url ||
      attachment?.file_url
    );
  } catch (error) {
    debugFacebook(
      `Failed to fetch Messenger story media for ${mid}: ${getErrorMessage(
        error,
      )}`,
    );
    return undefined;
  }
};

const readOpenGraphValue = (html: string, property: string) => {
  const escapedProperty = property.replace(
    /[.*+?^${}()|[\]\\]/g,
    String.raw`\$&`,
  );
  const pattern = new RegExp(
    `<meta[^>]+property=["']${escapedProperty}["'][^>]+content=["']([^"']*)`,
    'i',
  );
  return pattern.exec(html)?.[1]?.replace(/&amp;/g, '&');
};

export const fetchFacebookSharePreview = async (url?: string) => {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' ||
      (parsed.hostname !== 'facebook.com' &&
        !parsed.hostname.endsWith('.facebook.com'))
    ) {
      return undefined;
    }

    const response = await fetch(parsed.toString(), {
      headers: { 'user-agent': 'facebookexternalhit/1.1' },
      signal: AbortSignal.timeout(5000),
    });
    const finalUrl = new URL(response.url);
    if (
      finalUrl.hostname !== 'facebook.com' &&
      !finalUrl.hostname.endsWith('.facebook.com')
    ) {
      return undefined;
    }

    const html = await response.text();
    const previewUrl = readOpenGraphValue(html, 'og:image');

    return { previewUrl };
  } catch {
    return undefined;
  }
};

export const isFacebookStoryUrl = (url?: string) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === 'facebook.com' ||
        parsed.hostname.endsWith('.facebook.com')) &&
      parsed.pathname.startsWith('/stories/')
    );
  } catch {
    return false;
  }
};

export const getSharedAttachmentName = (url?: string) => {
  if (!url) return 'Shared content';

  try {
    const parsed = new URL(url);
    const isFacebook =
      parsed.hostname === 'facebook.com' ||
      parsed.hostname.endsWith('.facebook.com');
    const isInstagram =
      parsed.hostname === 'instagram.com' ||
      parsed.hostname.endsWith('.instagram.com');

    if (parsed.pathname.startsWith('/stories/')) {
      if (isFacebook) return 'Shared Facebook story';
      if (isInstagram) return 'Shared Instagram story';
    }

    if (parsed.pathname.startsWith('/reel/')) {
      if (isFacebook) return 'Facebook reel';
      if (isInstagram) return 'Instagram reel';
    }

    if (isFacebook) return 'Facebook post';
    if (isInstagram) return 'Instagram post';
  } catch {
    return 'Shared content';
  }

  return 'Shared content';
};

export const isStoryMessageKind = (messageKind?: string) =>
  messageKind === 'story_reply' || messageKind === 'story_mention';
