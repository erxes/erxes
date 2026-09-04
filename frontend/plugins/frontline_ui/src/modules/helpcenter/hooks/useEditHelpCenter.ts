import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { EDIT_TOPIC } from '@/knowledgebase/graphql/mutations';
import { IHelpCenter, IHelpCenterStyles } from '@/helpcenter/types';

const stripTypename = (
  styles: IHelpCenter['styles'],
): IHelpCenterStyles | undefined => {
  if (!styles) {
    return undefined;
  }

  const { __typename, ...rest } = styles as IHelpCenterStyles & {
    __typename?: string;
  };

  return rest;
};

export type THelpCenterPatch = Partial<
  Pick<
    IHelpCenter,
    | 'title'
    | 'code'
    | 'description'
    | 'languageCode'
    | 'color'
    | 'url'
    | 'kbToggle'
    | 'kbLabel'
    | 'ticketToggle'
    | 'ticketLabel'
    | 'ticketChannelId'
    | 'ticketPipelineId'
    | 'ticketStatusId'
  >
> & { brandId?: string };

export const useEditHelpCenter = () => {
  const { t } = useTranslation('frontline');
  const [editTopic, { loading }] = useMutation(EDIT_TOPIC);

  const editHelpCenter = (helpCenter: IHelpCenter, patch: THelpCenterPatch) => {
    const doc = {
      title: helpCenter.title ?? '',
      code: helpCenter.code ?? '',
      description: helpCenter.description ?? '',
      brandId: helpCenter.brand?._id ?? '',
      color: helpCenter.color ?? '',
      backgroundImage: helpCenter.backgroundImage ?? '',
      languageCode: helpCenter.languageCode ?? '',
      notificationSegmentId: helpCenter.notificationSegmentId ?? '',
      url: helpCenter.url ?? '',
      kbToggle: helpCenter.kbToggle ?? false,
      kbLabel: helpCenter.kbLabel ?? '',
      ticketToggle: helpCenter.ticketToggle ?? false,
      ticketLabel: helpCenter.ticketLabel ?? '',
      ticketChannelId: helpCenter.ticketChannelId ?? '',
      ticketPipelineId: helpCenter.ticketPipelineId ?? '',
      ticketStatusId: helpCenter.ticketStatusId ?? '',
      styles: stripTypename(helpCenter.styles),
      ...patch,
    };

    if (
      patch.ticketChannelId !== undefined &&
      patch.ticketChannelId !== helpCenter.ticketChannelId
    ) {
      doc.ticketPipelineId = '';
      doc.ticketStatusId = '';
    }

    if (
      patch.ticketPipelineId !== undefined &&
      patch.ticketPipelineId !== helpCenter.ticketPipelineId
    ) {
      doc.ticketStatusId = '';
    }

    if (!doc.title) {
      toast({
        title: t('error'),
        description: t('kb-topic-needs-title', 'A help center needs a name.'),
        variant: 'destructive',
      });
      return;
    }

    return editTopic({
      variables: { _id: helpCenter._id, doc },
      optimisticResponse: {
        knowledgeBaseTopicsEdit: {
          __typename: 'KnowledgeBaseTopic',
          _id: helpCenter._id,
          title: doc.title,
        },
      },
      update: (cache) => {
        cache.modify({
          id: cache.identify({
            __typename: 'KnowledgeBaseTopic',
            _id: helpCenter._id,
          }),
          fields: {
            title: () => doc.title,
            code: () => doc.code,
            description: () => doc.description,
            languageCode: () => doc.languageCode,
            color: () => doc.color,
            url: () => doc.url,
            kbToggle: () => doc.kbToggle,
            kbLabel: () => doc.kbLabel,
            ticketToggle: () => doc.ticketToggle,
            ticketLabel: () => doc.ticketLabel,
            ticketChannelId: () => doc.ticketChannelId,
            ticketPipelineId: () => doc.ticketPipelineId,
            ticketStatusId: () => doc.ticketStatusId,
            brand: (existing, { toReference }) =>
              patch.brandId
                ? toReference({ __typename: 'Brand', _id: patch.brandId })
                : existing,
          },
          optimistic: true,
        });
      },
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('kb-topic-saved', 'Help center saved'),
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { editHelpCenter, loading };
};
