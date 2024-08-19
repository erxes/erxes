import { __ } from '@erxes/ui/src';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  FormColumn,
  FormWrapper
} from "@erxes/ui/src/styles/main";
import React, { useEffect, useMemo, useState } from 'react';
import SelectAccount from '../../../settings/accounts/containers/SelectAccount';
import { IConfigsMap, GetRateQueryResponse } from '../../../settings/configs/types';
import { ITransaction } from '../../types';
import { gql, useLazyQuery } from '@apollo/client';
import { queries as configsQueries } from '../../../settings/configs/graphql'
import { getTempId } from '../../utils/utils';
import { JOURNALS, TR_SIDES } from '../../../constants';

type Props = {
  configsMap: IConfigsMap;
  trDoc: ITransaction;
  followTrDocs: ITransaction[];
  setTrDoc: (trDoc: ITransaction, fTrDocs?: ITransaction[]) => void;
  onChangeDetail: (key: string, value: any) => void;
};

const CurrencyFields = (props: Props) => {
  const { trDoc, setTrDoc, onChangeDetail, configsMap, followTrDocs } = props;
  const followData = (trDoc.follows || []).find(f => f.type === 'currencyDiff');
  const currentd = followTrDocs.find(ftr => ftr._id === followData?.id);

  const detail = trDoc?.details && trDoc?.details[0] || {};

  if (!detail || !detail.account) {
    return null;
  }

  if (detail.account.currency === (configsMap.MainCurrency || 'MNT')) {
    return null;
  }

  const getFollowTrDocs = () => {
    if (currentFollowTrDoc) {
      return followTrDocs.map(ftr => ftr._id === currentFollowTrDoc?._id && currentFollowTrDoc || ftr);
    }
    return followTrDocs.filter(ftr => ftr._id !== followData?.id);
  }

  const [spotRate, setSpotRate] = useState(0);

  const [getRate] = useLazyQuery<GetRateQueryResponse>(gql(configsQueries.getRate));

  useEffect(() => {
    getRate({
      variables: {
        date: trDoc.date || new Date(), currency: detail.account?.currency
      }
    }).then((data) => {
      setSpotRate(data?.data?.accountingsGetRate?.rate || 0)
    })
  }, [trDoc.date, detail.account]);

  useEffect(() => {
    if (spotRate) {
      setTrDoc(
        {
          ...trDoc,
          details: [{ ...detail, currencyAmount: (detail.amount || 0) / spotRate }]
        },
        getFollowTrDocs()
      );
    }
  }, [detail.amount]);

  const diffAmount: number = useMemo(() => {
    const multipler = detail.account?.status === 'active' && 1 || -1;
    return ((detail.customRate || 0) - spotRate) * (detail.currencyAmount || 0) * multipler;
  }, [spotRate, detail.customRate, detail.currencyAmount, detail.account]);

  const currentFollowTrDoc = useMemo(() => {
    if (!diffAmount) {
      return;
    }

    let amount = diffAmount;
    let side = detail.side;
    if (amount < 0) {
      side = TR_SIDES.DEBIT === detail.side ? TR_SIDES.CREDIT : TR_SIDES.DEBIT;
      amount = -1 * amount;
    }

    const { sumDt, sumCt } = side === TR_SIDES.DEBIT ? { sumDt: amount, sumCt: 0 } : { sumDt: 0, sumCt: amount }

    return {
      ...(currentFollowTrDoc || trDoc),
      _id: currentFollowTrDoc?._id || getTempId(),
      journal: JOURNALS.MAIN,
      originId: trDoc._id,
      details: [{
        ...(currentFollowTrDoc?.details || [{}])[0],
        accountId: detail.followInfos.currencyDiffAccountId,
        side,
        amount
      }],

      sumDt,
      sumCt,
    };

  }, [diffAmount]);

  const onChangeCurrencyAmount = (e) => {
    const value = (e.target as any).value
    setTrDoc(
      { ...trDoc, details: [{ ...detail, currencyAmount: value, amount: spotRate * value }] },
      getFollowTrDocs()
    );
  }

  return (
    <>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Currency Amount')}</ControlLabel>
            <FormControl
              type='number'
              name="amount"
              value={detail.currencyAmount || 0}
              autoFocus={true}
              required={true}
              onChange={onChangeCurrencyAmount}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Custom Rate')}</ControlLabel>
            <FormControl
              type='number'
              name="amount"
              value={detail.customRate || 0}
              autoFocus={true}
              required={true}
              onChange={e => onChangeDetail('customRate', (e.target as any).value)}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Spot Rate')}</ControlLabel>
            <FormControl
              type='number'
              name="amount"
              value={spotRate}
              disabled={true}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__(`${diffAmount > 0 && 'Loss' || 'Gain'} amount`)}</ControlLabel>
            <FormControl
              type='number'
              name="amount"
              value={diffAmount}
              disabled={true}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Account')}</ControlLabel>
            <SelectAccount
              multi={false}
              initialValue={detail.followInfos?.currencyDiffAccountId || ''}
              label='Diff Account'
              name='currencyDiffAccountId'
              filterParams={{ journals: ['main'] }}
              onSelect={(accountId) => { onChangeDetail('followInfos', { ...detail.followInfos, currencyDiffAccountId: accountId }) }}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
        </FormColumn>
      </FormWrapper>
    </>
  )
}

export default CurrencyFields;
