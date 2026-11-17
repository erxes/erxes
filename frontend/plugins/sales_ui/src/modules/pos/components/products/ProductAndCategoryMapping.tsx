import { useMutation } from '@apollo/client';
import { IconArrowsExchange } from '@tabler/icons-react';
import { toast, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import {
  type CatProdMappingDraft,
  toCatProdMappingsInput,
} from '@/pos/components/products/catProdMappings';
import { PosItemList } from '@/pos/components/pos-edit/PosItemList';
import { POS_CATEGORY_MAPPING_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { mutations } from '@/pos/graphql/mutations';
import { type CatProd } from '@/pos/pos-detail/types/IPos';

interface ProductAndCategoryMappingProps {
  posId?: string;
  mappings: CatProd[];
}

export const ProductAndCategoryMapping: React.FC<
  ProductAndCategoryMappingProps
> = ({ posId, mappings }) => {
  const { t } = useTranslation('sales');
  const { openNewRecord } = useSidePanel();
  const { confirm } = useConfirm();
  const [posEdit, { loading: deleting }] = useMutation(mutations.posEdit);

  const openMapping = (mappingId?: string) => {
    const draft: CatProdMappingDraft = { posId, mappingId };
    openNewRecord(POS_CATEGORY_MAPPING_CONTENT_TYPE, { ...draft });
  };

  const handleDelete = (mappingId: string) => {
    if (!posId) return;

    confirm({ message: t('confirm-remove-selected') }).then(async () => {
      try {
        await posEdit({
          variables: {
            _id: posId,
            catProdMappings: toCatProdMappingsInput(
              mappings.filter((mapping) => mapping._id !== mappingId),
            ),
          },
          refetchQueries: ['salesPosSettingsDetail'],
        });
        toast({
          title: t('success'),
          description: t('product-settings-saved'),
        });
      } catch (e) {
        toast({
          title: t('error'),
          description:
            e instanceof Error ? e.message : t('product-settings-save-failed'),
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <PosItemList
      items={mappings.map((mapping) => ({
        id: mapping._id,
        title: mapping.name || mapping.categoryId,
      }))}
      emptyIcon={IconArrowsExchange}
      emptyText={t('no-mappings-found')}
      addLabel={t('add-mapping')}
      addDisabled={!posId}
      deleting={deleting}
      onAdd={() => openMapping()}
      onEdit={openMapping}
      onDelete={handleDelete}
    />
  );
};
