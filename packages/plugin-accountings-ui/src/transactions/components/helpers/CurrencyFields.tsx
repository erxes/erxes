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
import { GetRateQueryResponse, IConfigsMap } from '../../../settings/configs/types';
import { ITransaction } from '../../types';
import { gql, useLazyQuery } from '@apollo/client';
import { queries as configsQueries } from '../../../settings/configs/graphql'
import { getTempId, getTrSide } from '../../utils/utils';
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

  const detail = trDoc?.details && trDoc?.details[0] || {};

  if (!detail || !detail.account) {
    return null;
  }

  if (detail.account.currency === (configsMap.MainCurrency || 'MNT')) {
    return null;
  }

  const getFollowTrDocs = () => {
    if (currentFollowTrDoc) {
      if (followTrDocs.filter(ftr => ftr._id === currentFollowTrDoc._id).length) {
        return {
          ftrDocs: followTrDocs.map(ftr => ftr._id === currentFollowTrDoc._id && currentFollowTrDoc || ftr),
          follows: [...trDoc.follows || []]
        };
      }

      return {
        ftrDocs: [...followTrDocs, currentFollowTrDoc],
        follows: [...(trDoc.follows || []).filter(f => f.type !== 'currencyDiff'), { id: currentFollowTrDoc._id, type: 'currencyDiff' }]
      };
    }

    return {
      ftrDocs: followTrDocs.filter(ftr => ftr._id !== followData?.id),
      follows: [...(trDoc.follows || []).filter(f => f.type !== 'currencyDiff')]
    };
  }

  const [spotRate, setSpotRate] = useState(0);

  const [getRate] = useLazyQuery<GetRateQueryResponse>(gql(configsQueries.getRate));

  useEffect(() => {
    getRate({
      variables: {
        date: trDoc.date || new Date(), currency: detail.account?.currency
      }
    }).then((data) => {
      setSpotRate(data?.data?.exchangeGetRate?.rate || 0)
    })
  }, [trDoc.date, detail.account]);

  const diffAmount: number = useMemo(() => {
    const multipler = detail.account?.status === 'active' && 1 || -1;
    return ((detail.customRate || 0) - spotRate) * (detail.currencyAmount || 0) * multipler;
  }, [spotRate, detail.customRate, detail.currencyAmount, detail.account]);

  useEffect(() => {
    if (spotRate) {

      const { ftrDocs, follows } = getFollowTrDocs()
      setTrDoc(
        {
          ...trDoc,
          details: [{ ...detail, currencyAmount: (detail.amount || 0) / spotRate }],
          follows
        },
        ftrDocs
      );
    }
  }, [detail.amount, diffAmount, detail.followInfos?.currencyDiffAccountId]);

  const currentFollowTrDoc = useMemo(() => {
    if (!diffAmount) {
      return;
    }

    let amount = diffAmount;
    let side = detail.side;
    if (amount < 0) {
      side = getTrSide(side, true)
      amount = -1 * amount;
    }

    const { sumDt, sumCt } = side === TR_SIDES.DEBIT ? { sumDt: amount, sumCt: 0 } : { sumDt: 0, sumCt: amount }

    const curr = followTrDocs.find(ftr => ftr._id === followData?.id) || trDoc;

    return {
      ...curr,
      _id: curr?._id || getTempId(),
      journal: JOURNALS.MAIN,
      originId: trDoc._id,
      details: [{
        ...(curr?.details || [{}])[0],
        accountId: detail.followInfos?.currencyDiffAccountId,
        account: detail.followInfos?.account,
        side,
        amount
      }],

      sumDt,
      sumCt,
    };

  }, [diffAmount, detail.followInfos?.currencyDiffAccountId]);

  const onChangeCurrencyAmount = (e) => {
    const value = (e.target as any).value
    const { ftrDocs, follows } = getFollowTrDocs()
    setTrDoc(
      { ...trDoc, details: [{ ...detail, currencyAmount: value, amount: spotRate * value }], follows },
      ftrDocs
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
              onSelect={(accountId, account) => { onChangeDetail('followInfos', { ...detail.followInfos, currencyDiffAccountId: accountId, account }) }}
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
