import { SelectFixedAssetsBulk } from '@/settings/fixed-assets/components/SelectFixedAssetsBulk';
import { IFixedAsset } from '@/settings/fixed-assets/types/FixedAsset';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import {
  ITransactionGroupForm,
  TFxaDetail,
  TTrDoc,
} from '../../../types/JournalForms';
import { getFxaDetailDefaultValues } from '../../helpers/fxaHelpers';

const getAvailableCount = (fixedAsset: IFixedAsset) =>
  fixedAsset.currentCount ?? fixedAsset.count ?? 0;

export const AddFixedAssetRow = ({
  append,
  form,
  journalIndex,
}: {
  append: (detail: TFxaDetail | TFxaDetail[]) => void;
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TTrDoc;
  const details = (trDoc?.details || []) as TFxaDetail[];
  const lastDetail = details[details.length - 1];

  const getDetailDefaultValues = (fixedAsset?: IFixedAsset) => {
    const availableCount = fixedAsset ? getAvailableCount(fixedAsset) : 0;
    const count = fixedAsset ? Math.min(1, availableCount) : 0;

    return getFxaDetailDefaultValues({
      ...lastDetail,
      fixedAssetId: fixedAsset?._id || '',
      fixedAssetCategoryId: fixedAsset?.categoryId || '',
      branchId: trDoc.branchId || '',
      departmentId: trDoc.departmentId || '',
      count,
      unitPrice: 0,
      amount: 0,
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="bg-border"
        onClick={() => append(getDetailDefaultValues())}
      >
        <IconPlus />
        Шинэ мөр
      </Button>
      <SelectFixedAssetsBulk
        fixedAssetIds={[]}
        onSelect={(_fixedAssetIds, fixedAssets) =>
          append(
            fixedAssets.map((fixedAsset) => getDetailDefaultValues(fixedAsset)),
          )
        }
      >
        <Button type="button" variant="secondary" className="bg-border">
          <IconPlus />
          Олон хөрөнгө нэмэх
        </Button>
      </SelectFixedAssetsBulk>
    </>
  );
};
