import { JournalEnum } from '@/settings/account/types/Account';
import { useWatch } from 'react-hook-form';
import { TR_SIDES } from '../../../types/constants';
import { ITransactionGroupForm } from '../../types/JournalForms';
import { CtaxForm } from '../helpers/CtaxForm';
import { CurrencyForm } from '../helpers/CurrencyForm';
import { CustomerFields } from '../helpers/CustomerFields';
import { RelAccountsForm } from '../helpers/RelAccountsForm';
import { VatForm } from '../helpers/VatForm';
import {
  AccountField,
  AmountField,
  AssignToField,
  BranchField,
  DepartmentField,
  DescriptionField,
  SideField,
} from './../GeneralFormFields';
import { useGetExchangeRate } from '../../hooks/useGetExchangeRate';

export const CashTransaction = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const date = useWatch({
    control: form.control,
    name: 'date',
  });
  const account = useWatch({
    control: form.control,
    name: `trDocs.${index}.details.0.account`,
  });
  const mainCurrency = 'MNT';
  const isForeignCurrency =
    !!account?.currency && account.currency !== mainCurrency;

  const { spotRate } = useGetExchangeRate({
    variables: { date, currency: account?.currency },
    skip: !isForeignCurrency,
  });

  const handleAmountChange = (value: number) => {
    if (!spotRate || !isForeignCurrency) {
      return;
    }

    form.setValue(`trDocs.${index}.details.0.currencyAmount`, value / spotRate);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <AccountField
          form={form}
          index={index}
          filter={{ journals: [JournalEnum.CASH] }}
        />
        <SideField form={form} index={index} sides={TR_SIDES.FUND_OPTIONS} />
        <AmountField
          form={form}
          index={index}
          onValueChange={handleAmountChange}
        />
        <CustomerFields form={form} index={index} />
        <AssignToField form={form} index={index} />
        <BranchField form={form} index={index} />
        <DepartmentField form={form} index={index} />
        <DescriptionField form={form} index={index} />
        <CurrencyForm form={form} journalIndex={index} spotRate={spotRate} />
        <VatForm
          form={form}
          journalIndex={index}
          isWithTax={true}
          isSameSide={false}
        />
        <CtaxForm
          form={form}
          journalIndex={index}
          isWithTax={true}
          isSameSide={false}
        />
      </div>
      <div className="pt-3">
        <RelAccountsForm form={form} index={index} />
      </div>
    </>
  );
};
