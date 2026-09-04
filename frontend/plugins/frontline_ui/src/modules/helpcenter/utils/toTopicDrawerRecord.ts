import { IHelpCenter } from '@/helpcenter/types';

export const toTopicDrawerRecord = (helpCenter?: IHelpCenter) => {
  if (!helpCenter) {
    return undefined;
  }

  return {
    _id: helpCenter._id,
    title: helpCenter.title ?? '',
    description: helpCenter.description ?? '',
    code: helpCenter.code ?? '',
    brandId: helpCenter.brand?._id ?? '',
    color: helpCenter.color ?? '',
    backgroundImage: helpCenter.backgroundImage ?? '',
    languageCode: helpCenter.languageCode ?? '',
    notificationSegmentId: helpCenter.notificationSegmentId ?? '',
    url: helpCenter.url ?? '',
    kbToggle: helpCenter.kbToggle ?? true,
    kbLabel: helpCenter.kbLabel ?? '',
    ticketToggle: helpCenter.ticketToggle ?? false,
    ticketLabel: helpCenter.ticketLabel ?? '',
    ticketChannelId: helpCenter.ticketChannelId ?? '',
    ticketPipelineId: helpCenter.ticketPipelineId ?? '',
    ticketStatusId: helpCenter.ticketStatusId ?? '',
    styles: helpCenter.styles ?? undefined,
  };
};
