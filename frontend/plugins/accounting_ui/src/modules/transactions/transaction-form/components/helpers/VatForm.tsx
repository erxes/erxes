import { useMainConfigs } from '@/settings/hooks/useMainConfigs';
import { SelectVat } from '@/settings/vat/components/SelectVatRow';
import { Checkbox, CurrencyField, Form } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { TrJournalEnum, TR_SIDES } from '../../../types/constants';
import { followTrDocsState, taxPercentsState } from '../../states/trStates';
import { ITransactionGroupForm } from '../../types/JournalForms';
import { IVatRow } from '@/settings/vat/types/VatRow';
import { getTempId } from '../utils';

export const VatForm = ({
  form,
  journalIndex,
  isWithTax,
  isSameSide
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  isWithTax?: boolean;
  isSameSide: boolean;
}) => {
  const [taxPercents, setTaxPercents] = useAtom(taxPercentsState);
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`
  });

  const hasVat = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.hasVat`
  });

  const mainSide = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.0.side`
  });

  const side = useMemo(() => {
    if (isSameSide) {
      return mainSide;
    }

    return mainSide === TR_SIDES.DEBIT ? TR_SIDES.CREDIT : TR_SIDES.DEBIT;
  }, [mainSide, isSameSide]);

  const handleVat = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.handleVat`,
  });

  const details = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details`
  });

  const { vat: vatPercent = 0, sum: sumPercent } = taxPercents;

  const calcedAmount = useMemo(() => {
    if (handleVat) {
      return trDoc.vatAmount ?? 0;
    }
    const sumAmount = details.filter(d => !d.excludeVat).reduce((sum, cur) => sum + (cur.amount ?? 0), 0);
    if (isWithTax) {
      return sumAmount / (100 + sumPercent) * vatPercent;
    }

    return sumAmount / 100 * vatPercent;

  }, [details, handleVat, vatPercent, sumPercent, isWithTax, trDoc.vatAmount]);


  const { configs } = useMainConfigs();
  const [followTrDocs, setFollowTrDocs] = useAtom(followTrDocsState);

  useEffect(() => {
    if (!trDoc.hasVat) {
      setFollowTrDocs((followTrDocs || []).filter(ftr => !(ftr.originId === trDoc._id && ftr.followType === 'vat')));
      return;
    }

    const { sumDt, sumCt } = side === TR_SIDES.DEBIT ? { sumDt: calcedAmount, sumCt: 0 } : { sumDt: 0, sumCt: calcedAmount };

    const curr = followTrDocs.find(ftr => ftr.originId === trDoc._id && ftr.followType === 'vat');

    const vatFtr = {
      ...curr,
      _id: curr?._id || getTempId(),
      journal: TrJournalEnum.TAX,
      originId: trDoc._id,
      followType: 'vat',
      details: [{
        ...(curr?.details || [{}])[0],
        accountId: trDoc.afterVat ?
          side === 'dt' ? configs?.VatAfterReceivableAccount ?? '' : (configs?.VatAfterPayableAccount ?? '') :
          side === 'dt' ? configs?.VatReceivableAccount : configs?.VatPayableAccount,
        side,
        amount: calcedAmount
      }],

      sumDt,
      sumCt,
    };
    setFollowTrDocs([
      ...(followTrDocs || []).filter(
        ftr => !(ftr.originId === trDoc._id && ftr.followType === 'vat')
      ),
      vatFtr
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVat, side, calcedAmount]);

  const changeVatRow = (vatRow: IVatRow) => {
    const vatPercent = vatRow.percent ?? 0;
    setTaxPercents({
      ...taxPercents,
      vat: vatPercent,
      sum: (taxPercents.ctax ?? 0) + vatPercent
    });
  }

  // Тухайн баримт нь өмнө нь НӨАТтай гээгүй бөгөөд байгууллагын тохиргоонд НӨАТгүй гэсэн бол НӨАТ байх ёсгүй
  if (!trDoc.hasVat && !configs?.HasVat) {
    return null;
  }

  return (
    <>
      {/* <VatEffects form={form} /> */}
      <Form.Field
        control={form.control}
        name={`trDocs.${journalIndex}.hasVat`}
        render={({ field }) => (
          <Form.Item className="flex items-center space-x-2 space-y-0 col-start-1 pt-5">
            <Form.Control>
              <Checkbox
                checked={field.value || false}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Label variant="peer">Has VAT</Form.Label>
          </Form.Item>
        )}
      />
      {hasVat && (
        <>
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.handleVat`}
            render={({ field }) => (
              <Form.Item className="flex items-center space-x-2 space-y-0 pt-5">
                <Form.Control>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Form.Label variant="peer">Handle VAT</Form.Label>
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.afterVat`}
            render={({ field }) => (
              <Form.Item className="flex items-center space-x-2 space-y-0 pt-5">
                <Form.Control>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Form.Label variant="peer">After VAT</Form.Label>
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.vatRowId`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>VAT row</Form.Label>
                <SelectVat value={field.value || ''} onValueChange={field.onChange} onCallback={changeVatRow} />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name={`trDocs.${journalIndex}.vatAmount`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>VAT amount</Form.Label>
                <CurrencyField.ValueInput
                  value={handleVat ? field.value ?? 0 : calcedAmount}
                  onChange={field.onChange}
                  disabled={!handleVat}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        </>
      )}
    </>
  );
};
