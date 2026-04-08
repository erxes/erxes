import { useLazyQuery } from '@apollo/client';
import { useConfirm, useToast } from 'erxes-ui';
import { useCreateElement } from '../hooks/useCreateElement';
import { IElement } from '../types/element';
import { GET_ELEMENT_DETAIL } from '../graphql/queries';

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
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { createElement, loading } = useCreateElement();
  const [fetchElementDetail, { loading: detailLoading }] = useLazyQuery<{
    bmsElementDetail: IElement;
  }>(GET_ELEMENT_DETAIL, {
    fetchPolicy: 'network-only',
  });
  const duplicateSuffix = ' (copy)';

  const handleDuplicate = () => {
    const buildDuplicatePayload = (source: IElement) => {
      const primaryLanguage = source.language;
      const primaryTranslation = source.translations?.find(
        (translation) => translation.language === primaryLanguage,
      );
      const primaryName = primaryTranslation?.name || source.name || '';
      const primaryNote = primaryTranslation?.note ?? source.note;
      const primaryCost = primaryTranslation?.cost ?? source.cost;
      const translations = source.translations
        ?.filter((translation) => translation.language !== primaryLanguage)
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
        translations: translations?.length ? translations : undefined,
      };
    };

    confirm({
      message: 'Are you sure you want to duplicate this element?',
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
              title: 'Success',
              variant: 'success',
              description: 'Element duplicated successfully',
            });
          },
          onError: (e: unknown) => {
            toast({
              title: 'Error',
              description: e instanceof Error ? e.message : 'Failed to duplicate element',
              variant: 'destructive',
            });
          },
        });
      } catch (e: unknown) {
        toast({
          title: 'Error',
          description: e instanceof Error ? e.message : 'Failed to load element detail',
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
