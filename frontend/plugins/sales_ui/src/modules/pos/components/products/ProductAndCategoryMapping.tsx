import { useMutation } from '@apollo/client';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, toast, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import {
  type CatProdMappingDraft,
  toCatProdMappingsInput,
} from '@/pos/components/products/catProdMappings';
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
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={!posId}
          onClick={() => openMapping()}
        >
          <IconPlus />
          {t('add-mapping')}
        </Button>
      </div>

      {mappings.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>{t('no-mappings-found')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mappings.map((mapping) => (
            <div
              key={mapping._id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <span className="text-sm">
                {mapping.name || mapping.categoryId}
              </span>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t('edit')}
                  onClick={() => openMapping(mapping._id)}
                >
                  <IconEdit size={16} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t('delete')}
                  disabled={deleting}
                  onClick={() => handleDelete(mapping._id)}
                  className="text-destructive"
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
