import { useGetExchangeRate } from '../../hooks/useGetExchangeRate';
import { CurrencyField, Form } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { TrJournalEnum, TR_SIDES } from '../../../types/constants';
import { followTrDocsState } from '../../states/trStates';
import { ITransactionGroupForm } from '../../types/JournalForms';
import { getTempId, getTrSide } from '../utils';
import { SelectAccount } from '@/settings/account/components/SelectAccount';

const CurrencyFormBody = ({
  form,
  journalIndex,
  spotRate: providedSpotRate,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  spotRate?: number;
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
  const mainCurrency = 'MNT';

  const { spotRate: fetchedSpotRate } = useGetExchangeRate({
    variables: { date, currency: detail.account?.currency },
    skip:
      providedSpotRate !== undefined ||
      !detail?.account?.currency ||
      detail?.account?.currency === mainCurrency,
  });
  const spotRate = providedSpotRate ?? fetchedSpotRate;

  const mainSide = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.side`,
  });

  const diffAmount: number = useMemo(() => {
    if (!detail.customRate) {
      return 0;
    }

    const multipler = detail.account?.kind === 'active' ? 1 : -1;
    return (
      (detail.customRate - spotRate) * (detail.currencyAmount || 0) * multipler
    );
  }, [spotRate, detail.customRate, detail.currencyAmount, detail.account]);

  const side = useMemo(() => {
    if (diffAmount < 0) {
      return getTrSide(mainSide, true);
    }
    return mainSide;
  }, [mainSide, diffAmount]);

  const setFollowTrDocs = useSetAtom(followTrDocsState);

  const handleCurrencyAmount = (
    value: number,
    onChange: (value: number) => void,
  ) => {
    const nextAmount = spotRate * value;

    onChange(value);
    form.setValue(`trDocs.${journalIndex}.details.0.amount`, nextAmount);
  };

  useEffect(() => {
    const currencyAmount = detail.currencyAmount ?? 0;

    if (!currencyAmount) {
      return;
    }

    const nextAmount = spotRate * currencyAmount;

    form.setValue(`trDocs.${journalIndex}.details.0.amount`, nextAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotRate]);

  useEffect(() => {
    if (!diffAmount) {
      setFollowTrDocs((prev) =>
        (prev || []).filter(
          (ftr) =>
            !(ftr.originId === trDoc._id && ftr.originType === 'exchangeDiff'),
        ),
      );
      return;
    }

    const { sumDt, sumCt } =
      side === TR_SIDES.DEBIT
        ? { sumDt: diffAmount, sumCt: 0 }
        : { sumDt: 0, sumCt: diffAmount };

    setFollowTrDocs((prev) => {
      const curr = (prev || []).find(
        (ftr) =>
          ftr.originId === trDoc._id && ftr.originType === 'exchangeDiff',
      );

      const currencyDiffFtr = {
        ...curr,
        _id: curr?._id || getTempId(),
        journal: TrJournalEnum.EXCHANGE_DIFF,
        side,
        originId: trDoc._id,
        originType: 'exchangeDiff',
        details: [
          {
            ...(curr?.details || [{}])[0],
            accountId:
              (detail?.followInfos as any)?.currencyDiffAccountId ?? '',
            amount: diffAmount,
          },
        ],

        sumDt,
        sumCt,
      };

      return [
        ...(prev || []).filter(
          (ftr) =>
            !(ftr.originId === trDoc._id && ftr.originType === 'exchangeDiff'),
        ),
        currencyDiffFtr,
      ];
    });
  }, [detail, diffAmount, side, trDoc._id, setFollowTrDocs]);

  return (
    <>
      <Form.Item>
        <Form.Label>Спот ханш</Form.Label>
        <CurrencyField.ValueInput value={spotRate} disabled />
        <Form.Message />
      </Form.Item>

      <Form.Field
        control={form.control}
        name={`trDocs.${journalIndex}.details.0.currencyAmount`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Валютын дүн</Form.Label>
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
            <Form.Label>Гараар оруулсан ханш</Form.Label>
            <CurrencyField.ValueInput
              value={field.value ?? 0}
              onChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Item>
        <Form.Label>{`Ханшийн ${
          diffAmount > 0 ? 'алдагдлын' : 'ашгийн'
        } дүн`}</Form.Label>
        <CurrencyField.ValueInput value={diffAmount} disabled={true} />
        <Form.Message />
      </Form.Item>

      {diffAmount !== 0 && (
        <Form.Field
          control={form.control}
          name={`trDocs.${journalIndex}.details.0.followInfos.currencyDiffAccountId`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{`Ханшийн ${
                diffAmount > 0 ? 'алдагдлын' : 'ашгийн'
              } данс`}</Form.Label>
              <Form.Control>
                <SelectAccount
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  defaultFilter={{
                    journals: ['exchangeDiff'],
                    permissionMode: 'write',
                  }}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </>
  );
};

export const CurrencyForm = ({
  form,
  journalIndex,
  spotRate,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  spotRate?: number;
}) => {
  const account = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.0.account`,
  });

  const mainCurrency = 'MNT';

  if (!account?.currency || account?.currency === mainCurrency) {
    return null;
  }

  return (
    <CurrencyFormBody
      form={form}
      journalIndex={journalIndex}
      spotRate={spotRate}
    />
  );
};
