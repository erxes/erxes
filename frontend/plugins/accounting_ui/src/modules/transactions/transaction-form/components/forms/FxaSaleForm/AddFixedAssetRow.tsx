import { useTranslation } from 'react-i18next';
import { FixedAssetChooser } from '@/settings/fixed-assets/components/chooser/FixedAssetChooser';
import { applyFxaChoice } from '@/transactions/transaction-form/components/helpers/applyFxaChoice';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import {
  ITransactionGroupForm,
  TFxaDetail,
  TTrDoc,
} from '../../../types/JournalForms';
import { getFxaDetailDefaultValues } from '../../helpers/fxaHelpers';

export const AddFixedAssetRow = ({
  append,
  form,
  journalIndex,
}: {
  append: (detail: TFxaDetail | TFxaDetail[]) => void;
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const { t } = useTranslation('accounting');
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TTrDoc;
  const date = useWatch({ control: form.control, name: 'date' });
  const details = (trDoc?.details || []) as TFxaDetail[];
  const lastDetail = details[details.length - 1];

  const getDetailDefaultValues = () =>
    getFxaDetailDefaultValues({
      ...lastDetail,
      followInfos: {
        ...lastDetail?.followInfos,
        fixedAssetCategoryId: '',
        fixedAssetCode: '',
        fixedAssetName: '',
      },
      fixedAssetId: '',

      branchId: trDoc.branchId || '',
      departmentId: trDoc.departmentId || '',
      count: 0,
      unitPrice: 0,
      amount: 0,
    });

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="bg-border"
        onClick={() => append(getDetailDefaultValues())}
      >
        <IconPlus />
        {t('new-row')}
      </Button>
      <FixedAssetChooser
        journal={trDoc.journal}
        date={date}
        branchId={trDoc.branchId}
        departmentId={trDoc.departmentId}
        excludeTransactionId={trDoc._id}
        multiple
        onChoose={(choices) => {
          const selected = choices.filter(
            (choice) => choice.asset._id && choice.location,
          );
          const offset = form.getValues(
            `trDocs.${journalIndex}.details`,
          ).length;
          append(selected.map(() => getDetailDefaultValues()));
          selected.forEach((choice, i) =>
            applyFxaChoice(form, journalIndex, offset + i, choice),
          );
        }}
      >
        <Button type="button" variant="secondary" className="bg-border">
          <IconPlus />
          {t('add-multiple-assets')}
        </Button>
      </FixedAssetChooser>
    </>
  );
};
