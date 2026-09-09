import {
  DEFAULT_HELP_CENTER_STYLES,
  EMPTY_HELP_CENTER_FORM,
} from '@/helpcenter/constants';
import {
  IHelpCenter,
  IHelpCenterConfigInput,
  IHelpCenterStyles,
} from '@/helpcenter/types';

export const stripStylesTypename = (
  styles: IHelpCenter['styles'],
): IHelpCenterStyles => {
  if (!styles) {
    return {};
  }

  const { __typename, ...rest } = styles as IHelpCenterStyles & {
    __typename?: string;
  };

  return rest;
};

export const toHelpCenterConfigInput = (
  helpCenter?: IHelpCenter,
): IHelpCenterConfigInput => {
  if (!helpCenter) {
    return {
      ...EMPTY_HELP_CENTER_FORM,
      styles: { ...DEFAULT_HELP_CENTER_STYLES },
    };
  }

  return {
    _id: helpCenter._id,
    title: helpCenter.title ?? '',
    description: helpCenter.description ?? '',
    url: helpCenter.url ?? '',
    brandId: helpCenter.brandId ?? helpCenter.brand?._id ?? '',
    languageCode: helpCenter.languageCode ?? '',
    kbToggle: helpCenter.kbToggle ?? true,
    kbLabel: helpCenter.kbLabel ?? '',
    kbTopicId: helpCenter.kbTopicId ?? '',
    ticketToggle: helpCenter.ticketToggle ?? false,
    ticketLabel: helpCenter.ticketLabel ?? '',
    ticketChannelId: helpCenter.ticketChannelId ?? '',
    ticketPipelineId: helpCenter.ticketPipelineId ?? '',
    ticketStatusId: helpCenter.ticketStatusId ?? '',
    color: helpCenter.color ?? EMPTY_HELP_CENTER_FORM.color,
    backgroundImage: helpCenter.backgroundImage ?? '',
    styles: {
      ...DEFAULT_HELP_CENTER_STYLES,
      ...stripStylesTypename(helpCenter.styles),
    },
  };
};
