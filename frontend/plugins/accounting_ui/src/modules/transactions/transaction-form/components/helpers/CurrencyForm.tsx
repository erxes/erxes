import { useMainConfigs } from '@/settings/hooks/useMainConfigs';
import { useGetExchangeRate } from '../../hooks/useGetExchangeRate';
import { CurrencyField, Form } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { TrJournalEnum, TR_SIDES } from '../../../types/constants';
import { followTrDocsState } from '../../states/trStates';
import { ITransactionGroupForm } from '../../types/JournalForms';
import { getTempId, getTrSide } from '../utils';
import { SelectAccount } from '@/settings/account/components/SelectAccount';

const CurrencyFormBody = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const date = useWatch({
    control: form.control,
    name: `date`,
  });

  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  });

  const detail = trDoc.details[0];
  const amount = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.0.amount`,
  });
  const [changingAmount, setChangingAmount] = useState(true);

  const { configs } = useMainConfigs();
  const mainCurrency = 'MNT';

  const { spotRate } = useGetExchangeRate({
    variables: { date, currency: detail.account?.currency },
    skip:
      !detail?.account?.currency || detail?.account?.currency === mainCurrency,
  });

  const mainSide = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.0.side`,
  });

  const diffAmount: number = useMemo(() => {
    const multipler = detail.account?.kind === 'active' ? 1 : -1;
    return (
      ((detail.customRate || 0) - spotRate) *
      (detail.currencyAmount || 0) *
      multipler
    );
  }, [spotRate, detail.customRate, detail.currencyAmount, detail.account]);

  const side = useMemo(() => {
    if (diffAmount < 0) {
      return getTrSide(mainSide, true);
    }
    return mainSide;
  }, [mainSide, diffAmount]);

  const [followTrDocs, setFollowTrDocs] = useAtom(followTrDocsState);

  const handleCurrencyAmount = (
    value: number,
    onChange: (value: number) => void,
  ) => {
    if (changingAmount) {
      return setChangingAmount(false);
    }
    form.setValue(`trDocs.${journalIndex}.details.0.amount`, spotRate * value);
    onChange(value);
  };

  useEffect(() => {
    form.setValue(`trDocs.${journalIndex}.details.0.amount`, spotRate * (detail.currencyAmount ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotRate]);

  useEffect(() => {
    if (spotRate) {
      setChangingAmount(true);
      form.setValue(
        `trDocs.${journalIndex}.details.0.currencyAmount`,
        amount / spotRate,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  useEffect(() => {
    if (!diffAmount) {
      setFollowTrDocs(
        (followTrDocs || []).filter(
          (ftr) =>
            !(ftr.originId === trDoc._id && ftr.followType === 'currencyDiff'),
        ),
      );
      return;
    }

    const { sumDt, sumCt } = side === TR_SIDES.DEBIT ? { sumDt: diffAmount, sumCt: 0 } : { sumDt: 0, sumCt: diffAmount };

    const curr = followTrDocs.find(ftr => ftr.originId === trDoc._id && ftr.followType === 'currencyDiff');

    const currencyDiffFtr = {
      ...curr,
      _id: curr?._id || getTempId(),
      journal: TrJournalEnum.TAX,
      originId: trDoc._id,
      followType: 'currencyDiff',
      details: [{
        ...(curr?.details || [{}])[0],
        accountId: (detail?.followInfos as any)?.currencyDiffAccountId ?? '',
        side,
        amount: diffAmount
      }],

      sumDt,
      sumCt,
    };

    setFollowTrDocs([...(followTrDocs || []).filter(ftr => !(ftr.originId === trDoc._id && ftr.followType === 'currencyDiff')), currencyDiffFtr]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, diffAmount, side]);

  return (
    <>
      <Form.Item>
        <Form.Label>Spot Rate</Form.Label>
        <CurrencyField.ValueInput value={spotRate} disabled />
        <Form.Message />
      </Form.Item>

      <Form.Field
        control={form.control}
        name={`trDocs.${journalIndex}.details.0.currencyAmount`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Currency amount</Form.Label>
            <CurrencyField.ValueInput
              value={field.value ?? 0}
              onChange={(value) =>
                handleCurrencyAmount(value || 0, field.onChange)
              }
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={`trDocs.${journalIndex}.details.0.customRate`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Custom Rate</Form.Label>
            <CurrencyField.ValueInput
              value={field.value ?? 0}
              onChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Item>
        <Form.Label>{`${diffAmount > 0 ? 'Loss' : 'Gain'} amount`}</Form.Label>
        <CurrencyField.ValueInput value={diffAmount} disabled={true} />
        <Form.Message />
      </Form.Item>

      {diffAmount !== 0 && (
        <Form.Field
          control={form.control}
          name={`trDocs.${journalIndex}.details.0.followInfos.currencyDiffAccountId`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{`${diffAmount > 0 ? 'Loss' : 'Gain'
                } account`}</Form.Label>
              <Form.Control>
                <SelectAccount
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: ['main'] }}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </>
  );
}

export const CurrencyForm = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const account = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.0.account`,
  });

  const mainCurrency = 'MNT';

  if (
    !account?.currency ||
    account?.currency === mainCurrency
  ) {
    return null;
  }

  return <CurrencyFormBody
    form={form}
    journalIndex={journalIndex}
  />

};
