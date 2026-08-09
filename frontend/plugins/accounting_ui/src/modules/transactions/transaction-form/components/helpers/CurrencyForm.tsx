import { useMainConfigs } from '@/settings/hooks/useMainConfigs';
import { useGetExchangeRate } from '../../hooks/useGetExchangeRate';
import { CurrencyField, Form } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { useWatch } from 'react-hook-form';
import { TrJournalEnum, TR_SIDES } from '../../../types/constants';
import { followTrDocsState } from '../../states/trStates';
import { ITransactionGroupForm } from '../../types/JournalForms';
import { getTempId, getTrSide } from '../utils';
import { SelectAccount } from '@/settings/account/components/SelectAccount';

type TAmountChangeHandler = (value: number) => void;
export type TAmountChangeRef = MutableRefObject<TAmountChangeHandler>;
type TChangingField = 'amount' | 'currencyAmount' | null;

const isSameAmount = (first?: number, second?: number) =>
  Math.abs((first || 0) - (second || 0)) < 0.000001;

export const useCurrencyAmountSync = (): TAmountChangeRef =>
  useRef<TAmountChangeHandler>(() => undefined);

const CurrencyFormBody = ({
  form,
  journalIndex,
  amountChangeRef,
  mainCurrency,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  amountChangeRef?: TAmountChangeRef;
  mainCurrency: string;
}) => {
  const date = useWatch({
    control: form.control,
    name: `date`,
  });

  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  });
  const changingFieldRef = useRef<TChangingField>(null);

  const setChangingField = (field: TChangingField) => {
    changingFieldRef.current = field;
  };

  const resetChangingField = (field: TChangingField) => {
    Promise.resolve().then(() => {
      if (changingFieldRef.current === field) {
        setChangingField(null);
      }
    });
  };

  const detail = trDoc.details[0];
  const accountKind = detail.account?.kind;
  const currencyAmount = detail.currencyAmount || 0;
  const currencyDiffAccountId =
    detail.followInfos && 'currencyDiffAccountId' in detail.followInfos
      ? detail.followInfos.currencyDiffAccountId
      : '';
  const customRate = detail.customRate || 0;

  const { spotRate } = useGetExchangeRate({
    variables: { date, currency: detail.account?.currency },
    skip:
      !detail?.account?.currency || detail?.account?.currency === mainCurrency,
  });

  const mainSide = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.side`,
  });

  useEffect(() => {
    if (!amountChangeRef) {
      return;
    }

    amountChangeRef.current = (value: number) => {
      if (!spotRate) {
        return;
      }

      if (changingFieldRef.current === 'currencyAmount') {
        return;
      }

      setChangingField('amount');
      const nextCurrencyAmount = value / spotRate;
      const currentCurrencyAmount = form.getValues(
        `trDocs.${journalIndex}.details.0.currencyAmount`,
      );

      if (!isSameAmount(currentCurrencyAmount, nextCurrencyAmount)) {
        form.setValue(
          `trDocs.${journalIndex}.details.0.currencyAmount`,
          nextCurrencyAmount,
        );
      }

      resetChangingField('amount');
    };

    return () => {
      amountChangeRef.current = () => undefined;
    };
  }, [amountChangeRef, form, journalIndex, spotRate]);

  useEffect(() => {
    if (!currencyAmount || !spotRate) {
      return;
    }

    if (changingFieldRef.current === 'amount') {
      return;
    }

    const nextAmount = spotRate * currencyAmount;
    const currentAmount = form.getValues(
      `trDocs.${journalIndex}.details.0.amount`,
    );

    if (isSameAmount(currentAmount, nextAmount)) {
      return;
    }

    form.setValue(
      `trDocs.${journalIndex}.details.0.amount`,
      nextAmount,
    );
  }, [currencyAmount, form, journalIndex, spotRate]);

  const diffAmount: number = useMemo(() => {
    if (!customRate || !spotRate) {
      return 0;
    }

    const multipler = accountKind === 'active' ? 1 : -1;
    return (customRate - spotRate) * currencyAmount * multipler;
  }, [accountKind, currencyAmount, customRate, spotRate]);

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
    if (changingFieldRef.current === 'amount') {
      return;
    }

    setChangingField('currencyAmount');
    onChange(value);

    if (!spotRate) {
      resetChangingField('currencyAmount');
      return;
    }

    const nextAmount = spotRate * value;
    const currentAmount = form.getValues(
      `trDocs.${journalIndex}.details.0.amount`,
    );

    if (!isSameAmount(currentAmount, nextAmount)) {
      form.setValue(
        `trDocs.${journalIndex}.details.0.amount`,
        nextAmount,
      );
    }
    resetChangingField('currencyAmount');
  };

  useEffect(() => {
    if (!diffAmount) {
      setFollowTrDocs((prev) => {
        const current = prev || [];
        const next = current.filter(
          (ftr) =>
            !(ftr.originId === trDoc._id && ftr.originType === 'exchangeDiff'),
        );

        return next.length === current.length ? prev : next;
      });
      return;
    }

    const { sumDt, sumCt } =
      side === TR_SIDES.DEBIT
        ? { sumDt: diffAmount, sumCt: 0 }
        : { sumDt: 0, sumCt: diffAmount };

    setFollowTrDocs((prev) => {
      const current = prev || [];
      const curr = current.find(
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
            accountId: currencyDiffAccountId,
            amount: diffAmount,
          },
        ],

        sumDt,
        sumCt,
      };

      if (
        curr?.side === currencyDiffFtr.side &&
        curr?.sumDt === currencyDiffFtr.sumDt &&
        curr?.sumCt === currencyDiffFtr.sumCt &&
        curr?.details?.[0]?.accountId ===
          currencyDiffFtr.details[0].accountId &&
        curr?.details?.[0]?.amount === currencyDiffFtr.details[0].amount
      ) {
        return prev;
      }

      return [
        ...current.filter(
          (ftr) =>
            !(ftr.originId === trDoc._id && ftr.originType === 'exchangeDiff'),
        ),
        currencyDiffFtr,
      ];
    });
  }, [currencyDiffAccountId, diffAmount, side, trDoc._id, setFollowTrDocs]);

  return (
    <>
      <Form.Item>
        <Form.Label>Спот ханш</Form.Label>
        <CurrencyField.ValueInput value={spotRate || 0} disabled />
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
  amountChangeRef,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  amountChangeRef?: TAmountChangeRef;
}) => {
  const account = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details.0.account`,
  });

  const { configs } = useMainConfigs();
  const mainCurrency = configs?.MainCurrency || 'MNT';

  if (!account?.currency || account?.currency === mainCurrency) {
    return null;
  }

  return (
    <CurrencyFormBody
      form={form}
      journalIndex={journalIndex}
      amountChangeRef={amountChangeRef}
      mainCurrency={mainCurrency}
    />
  );
};
