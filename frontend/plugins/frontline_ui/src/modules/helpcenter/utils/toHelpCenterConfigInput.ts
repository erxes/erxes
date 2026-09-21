import {
  createDefaultFooter,
  createDefaultHeader,
  DEFAULT_HELP_CENTER_STYLES,
  EMPTY_HELP_CENTER_FORM,
} from '@/helpcenter/constants';
import {
  IHelpCenter,
  IHelpCenterConfigInput,
  IHelpCenterFooter,
  IHelpCenterHeader,
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

export const toHeaderInput = (
  header: IHelpCenter['header'],
): IHelpCenterHeader => {
  if (!header) {
    return createDefaultHeader();
  }

  return {
    wordmark: header.wordmark ?? '',
    homeLabel: header.homeLabel ?? '',
    formsLabel: header.formsLabel ?? '',
    announcementsLabel: header.announcementsLabel ?? '',
    searchPlaceholder: header.searchPlaceholder ?? '',
  };
};

export const toFooterInput = (
  footer: IHelpCenter['footer'],
): IHelpCenterFooter => {
  if (!footer) {
    return createDefaultFooter();
  }

  return {
    logo: footer.logo ?? '',
    description: footer.description ?? '',
    copyright: footer.copyright ?? '',
    columns: (footer.columns ?? []).map((column) => ({
      heading: column.heading ?? '',
      links: (column.links ?? []).map((link) => ({
        label: link.label ?? '',
        url: link.url ?? '',
      })),
    })),
  };
};

export const toHelpCenterConfigInput = (
  helpCenter?: IHelpCenter,
): IHelpCenterConfigInput => {
  if (!helpCenter) {
    return {
      ...EMPTY_HELP_CENTER_FORM,
      styles: { ...DEFAULT_HELP_CENTER_STYLES },
      header: createDefaultHeader(),
      footer: createDefaultFooter(),
    };
  }

  return {
    _id: helpCenter._id,
    title: helpCenter.title ?? '',
    description: helpCenter.description ?? '',
    url: helpCenter.url ?? '',
    erxesAppToken: helpCenter.erxesAppToken ?? '',
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
    header: toHeaderInput(helpCenter.header),
    footer: toFooterInput(helpCenter.footer),
  };
};
