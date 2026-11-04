import { useLazyQuery } from '@apollo/client';
import { useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCreateElement } from '../hooks/useCreateElement';
import { IElement, IElementDetail } from '../types/element';
import { GET_ELEMENT_DETAIL } from '../graphql/queries';
import { compactList } from '~/utils/cursorList';

interface ElementDuplicateProps {
  element: IElement;
  branchId?: string;
  children: (props: {
    onClick: () => void;
    disabled: boolean;
  }) => React.ReactNode;
}

export const ElementDuplicate = ({
  element,
  branchId,
  children,
}: ElementDuplicateProps) => {
  const { t } = useTranslation('tourism');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { createElement, loading } = useCreateElement();
  const [fetchElementDetail, { loading: detailLoading }] = useLazyQuery(
    GET_ELEMENT_DETAIL,
    {
      fetchPolicy: 'network-only',
    },
  );
  const duplicateSuffix = ' (copy)';

  const handleDuplicate = () => {
    const buildDuplicatePayload = (source: IElementDetail) => {
      const primaryLanguage = source.language;
      const sourceTranslations = compactList(source.translations);
      const primaryTranslation = sourceTranslations.find(
        (translation) => translation.language === primaryLanguage,
      );
      const primaryName = primaryTranslation?.name || source.name || '';
      const primaryNote = primaryTranslation?.note ?? source.note;
      const primaryCost = primaryTranslation?.cost ?? source.cost;
      const translations = sourceTranslations
        .filter((translation) => translation.language !== primaryLanguage)
        .map((translation) => ({
          language: translation.language,
          name: translation.name
            ? `${translation.name}${duplicateSuffix}`
            : undefined,
          note: translation.note,
          cost: translation.cost,
        }))
        .filter(
          (translation) =>
            translation.name ||
            translation.note ||
            translation.cost !== undefined,
        );

      return {
        branchId: branchId || source.branchId,
        name: `${primaryName}${duplicateSuffix}`,
        note: primaryNote,
        startTime: source.startTime,
        duration: source.duration,
        cost: primaryCost,
        categories: source.categories,
        quick: source.quick,
        language: primaryLanguage,
        translations: translations.length ? translations : undefined,
      };
    };

    confirm({
      message: t('confirm-duplicate-element'),
      options: { confirmationValue: 'duplicate' },
    }).then(async () => {
      try {
        const { data } = await fetchElementDetail({
          variables: { id: element._id },
        });

        if (!data?.bmsElementDetail) {
          throw new Error('Failed to load element detail');
        }
        const source = data.bmsElementDetail;

        await createElement({
          variables: buildDuplicatePayload(source),
          onCompleted: () => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('element-duplicated-successfully'),
            });
          },
          onError: (e: unknown) => {
            toast({
              title: t('error'),
              description:
                e instanceof Error ? e.message : t('failed-to-create-element'),
              variant: 'destructive',
            });
          },
        });
      } catch (e: unknown) {
        toast({
          title: t('error'),
          description:
            e instanceof Error ? e.message : t('failed-to-load-element-detail'),
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <>
      {children({
        onClick: handleDuplicate,
        disabled: loading || detailLoading,
      })}
    </>
  );
};
