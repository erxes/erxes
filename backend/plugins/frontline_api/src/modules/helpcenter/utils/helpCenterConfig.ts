import {
  removeExtraSpaces,
  removeLastTrailingSlash,
} from 'erxes-api-shared/utils';
import { IHelpCenterConfigInput } from '@/helpcenter/@types/helpCenterConfig';

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);

    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

export const normalizeHelpCenterUrl = (url?: string): string =>
  url ? removeExtraSpaces(removeLastTrailingSlash(url)) : '';

export const normalizeHelpCenterConfig = (
  config: IHelpCenterConfigInput,
): IHelpCenterConfigInput => {
  const title = config.title?.trim() ?? '';
  const url = normalizeHelpCenterUrl(config.url);

  if (!title) {
    throw new Error('Please enter a help center name');
  }

  if (url && !isHttpUrl(url)) {
    throw new Error('Please enter a valid website address');
  }

  const kbToggle = config.kbToggle ?? false;
  const ticketToggle = config.ticketToggle ?? false;

  if (kbToggle && !config.kbTopicId) {
    throw new Error('Please choose a knowledge base topic');
  }

  if (ticketToggle && !config.ticketChannelId) {
    throw new Error('Please choose a ticket channel');
  }

  if (ticketToggle && !config.ticketPipelineId) {
    throw new Error('Please choose a ticket pipeline');
  }

  return {
    ...config,
    title,
    url,
    erxesAppToken: config.erxesAppToken?.trim() ?? '',
    description: config.description?.trim() ?? '',
    kbToggle,
    kbLabel: kbToggle ? (config.kbLabel?.trim() ?? '') : '',
    kbTopicId: kbToggle ? (config.kbTopicId ?? '') : '',
    ticketToggle,
    ticketLabel: ticketToggle ? (config.ticketLabel?.trim() ?? '') : '',
    ticketChannelId: ticketToggle ? (config.ticketChannelId ?? '') : '',
    ticketPipelineId: ticketToggle ? (config.ticketPipelineId ?? '') : '',
    ticketStatusId: ticketToggle ? (config.ticketStatusId ?? '') : '',
  };
};
