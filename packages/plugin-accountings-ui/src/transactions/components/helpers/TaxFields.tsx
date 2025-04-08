import { __ } from '@erxes/ui/src';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  FormColumn,
  FormWrapper
} from "@erxes/ui/src/styles/main";
import React, { useEffect, useMemo } from 'react';
import { IConfigsMap } from '../../../settings/configs/types';
import { ITransaction } from '../../types';
import SelectVatRow from '../../../settings/vatRows/containers/SelectVatRow';
import SelectCtaxRow from '../../../settings/ctaxRows/containers/SelectCtaxRow';
import { IVatRow } from '../../../settings/vatRows/types';
import { ICtaxRow } from '../../../settings/ctaxRows/types';
import { getTempId } from '../../utils/utils';
import { JOURNALS, TR_SIDES } from '../../../constants';

type Props = {
  configsMap: IConfigsMap;
  trDoc: ITransaction;
  followTrDocs: ITransaction[];
  isWithTax?: boolean;
  side: string;
  setTrDoc: (trDoc: ITransaction, fTrDocs?: ITransaction[]) => void;
};

const checkFollowDocs = (currentFollowTrDoc, type, followData, checkFollowTrDocs, checkFollows) => {
  if (currentFollowTrDoc) {
    if (checkFollowTrDocs.filter(ftr => ftr._id === currentFollowTrDoc._id).length) {
      return {
        ftrDocs: checkFollowTrDocs.map(ftr => ftr._id === currentFollowTrDoc._id && currentFollowTrDoc || ftr),
        follows: [...checkFollows || []]
      };
    }

    return {
      ftrDocs: [...checkFollowTrDocs, currentFollowTrDoc],
      follows: [...(checkFollows || []).filter(f => f.type !== type), { id: currentFollowTrDoc._id, type }]
    };
  }

  return {
    ftrDocs: checkFollowTrDocs.filter(ftr => ftr._id !== followData?.id),
    follows: [...(checkFollows || []).filter(f => f.type !== type)]
  };
}

const TaxFields = (props: Props) => {
  const { trDoc, setTrDoc, followTrDocs, configsMap, isWithTax, side } = props;
  const vatFollowData = (trDoc.follows || []).find(f => f.type === 'vat');
  const ctaxFollowData = (trDoc.follows || []).find(f => f.type === 'ctax');

  const sumVatAmount = trDoc?.details.filter(d => !d.excludeVat).reduce((sum, cur) => sum + (cur?.amount || 0), 0);
  const sumCtaxAmount = trDoc?.details.filter(d => !d.excludeCtax).reduce((sum, cur) => sum + (cur?.amount || 0), 0);

  const onVatRowChange = (vatRowId: string, obj?: IVatRow) => {
    setTrDoc({
      ...trDoc,
      vatRowId,
      vatRow: obj,
    });
  }

  const onCtaxRowChange = (ctaxRowId, obj?: ICtaxRow) => {
    setTrDoc({
      ...trDoc,
      ctaxRowId,
      ctaxRow: obj,
    });
  }

  const sumPercent = useMemo(() => {
    return (
      trDoc.hasVat ? (trDoc.vatRow?.percent || 0) : 0) +
      (trDoc.hasCtax ? (trDoc.ctaxRow?.percent || 0) : 0
      )
  }, [trDoc.hasVat, trDoc.vatRowId, trDoc.hasCtax, trDoc.ctaxRowId])

  const vatFollowTrDoc = useMemo(() => {
    if (!trDoc.hasVat) {
      return;
    }

    const amount = isWithTax ?
      sumVatAmount / (100 + sumPercent) * (trDoc.vatRow?.percent || 0) :
      sumVatAmount / 100 * (trDoc.vatRow?.percent || 0) || 0;

    const { sumDt, sumCt } = side === TR_SIDES.DEBIT ? { sumDt: amount, sumCt: 0 } : { sumDt: 0, sumCt: amount }

    const curr = followTrDocs.find(ftr => ftr._id === vatFollowData?.id);

    return {
      ...curr || trDoc,
      _id: curr?._id || getTempId(),
      journal: JOURNALS.VAT,
      originId: trDoc._id,
      details: [{
        ...(curr?.details || [{}])[0],
        accountId: trDoc.afterVat ?
          side === 'dt' ? configsMap.VatAfterReceivableAccount : configsMap.VatAfterPayableAccount :
          side === 'dt' ? configsMap.VatReceivableAccount : configsMap.VatPayableAccount,
        side,
        amount
      }],

      sumDt,
      sumCt,
    };

  }, [trDoc.hasVat, trDoc.afterVat, trDoc.vatAmount, trDoc.hasCtax, trDoc.ctaxAmount, (trDoc.details || [])[0]?.side]);

  const ctaxFollowTrDoc = useMemo(() => {
    if (!trDoc.hasCtax) {
      return;
    }

    if (side === TR_SIDES.DEBIT) {
      return;
    }

    const amount = isWithTax ?
      sumCtaxAmount / (100 + sumPercent) * (trDoc.ctaxRow?.percent || 0) :
      sumCtaxAmount / 100 * (trDoc.ctaxRow?.percent || 0) || 0;

    const { sumDt, sumCt } = side === TR_SIDES.DEBIT ? { sumDt: amount, sumCt: 0 } : { sumDt: 0, sumCt: amount }

    const curr = followTrDocs.find(ftr => ftr._id === ctaxFollowData?.id);

    return {
      ...curr || trDoc,
      _id: curr?._id || getTempId(),
      journal: JOURNALS.CTAX,
      originId: trDoc._id,
      details: [{
        ...(curr?.details || [{}])[0],
        accountId: configsMap.CtaxPayableAccount,
        side,
        amount
      }],

      sumDt,
      sumCt,
    };
  }, [trDoc.hasCtax, trDoc.ctaxAmount, trDoc.hasVat, trDoc.vatAmount, (trDoc.details || [])[0]?.side]);

  const getFollowTrDocs = () => {
    const vatCalced = checkFollowDocs(vatFollowTrDoc, 'vat', vatFollowData, followTrDocs, trDoc.follows);
    const ctaxCalced = checkFollowDocs(ctaxFollowTrDoc, 'ctax', ctaxFollowData, vatCalced.ftrDocs, vatCalced.follows);
    return ctaxCalced
  }

  useEffect(() => {
    const { ftrDocs, follows } = getFollowTrDocs()
    setTrDoc(
      {
        ...trDoc,
        follows
      },
      ftrDocs
    );

  }, [trDoc.hasVat, trDoc.vatAmount, trDoc.hasCtax, trDoc.ctaxAmount, (trDoc.details || [])[0]?.side]);

  const setTrDocWrapper = (paramsTrDoc) => {
    setTrDoc({ ...trDoc, ...paramsTrDoc }, followTrDocs);
  }

  const renderVat = () => {
    if (!configsMap.HasVat && !trDoc.hasVat) {
      return null;
    }

    if (!trDoc.hasVat) {
      return (
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('has vat')}</ControlLabel>
              <FormControl
                componentclass='checkbox'
                name="hasVat"
                checked={trDoc.hasVat}
                onChange={(e: any) => {
                  setTrDocWrapper({ hasVat: !trDoc.hasVat });
                }}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      )
    }

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>{__('has vat')}</ControlLabel>
                  <FormControl
                    componentclass='checkbox'
                    name="hasVat"
                    checked={trDoc.hasVat}
                    onChange={(e: any) => {
                      setTrDocWrapper({ hasVat: !trDoc.hasVat });
                    }}
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>{__('handle vat')}</ControlLabel>
                  <FormControl
                    componentclass='checkbox'
                    name="isHandleVat"
                    checked={trDoc.isHandleVat}
                    onChange={(e: any) => {
                      setTrDocWrapper({ isHandleVat: e.target.checked });
                    }}
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>{__('after vat')}</ControlLabel>
                  <FormControl
                    componentclass='checkbox'
                    name="afterVat"
                    checked={trDoc.afterVat}
                    onChange={(e: any) => {
                      setTrDocWrapper({ afterVat: e.target.checked });
                    }}
                  />
                </FormGroup>
              </FormColumn>
            </FormWrapper>

          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Vat Row')}</ControlLabel>
              <SelectVatRow
                multi={false}
                initialValue={trDoc.vatRowId || ''}
                label='Vat Row'
                name='vatRowId'
                onSelect={(vatRowId, obj) => onVatRowChange(vatRowId as string, obj)}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Vat Amount')}</ControlLabel>
              <FormControl
                type='number'
                name="vatAmount"
                value={
                  trDoc.isHandleVat ? trDoc.vatAmount : (
                    isWithTax ?
                      sumVatAmount / (100 + sumPercent) * (trDoc.vatRow?.percent || 0) :
                      sumVatAmount / 100 * (trDoc.vatRow?.percent || 0) || 0
                  )
                }
                disabled={!trDoc.isHandleVat}
                onChange={e => setTrDocWrapper({ vatAmount: (e.target as any).value })}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
          </FormColumn>
          <FormColumn>

          </FormColumn>
          <FormColumn>
          </FormColumn>
        </FormWrapper>
      </>
    )
  }

  const renderCtax = () => {
    if (!configsMap.HasCtax && !trDoc.hasCtax) {
      return null;
    }

    if (!trDoc.hasCtax) {
      return (
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('has ctax')}</ControlLabel>
              <FormControl
                componentclass='checkbox'
                name="hasCtax"
                checked={trDoc.hasCtax}
                onChange={(e: any) => {
                  setTrDocWrapper({ hasCtax: !trDoc.hasCtax });
                }}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      )
    }

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>{__('has ctax')}</ControlLabel>
                  <FormControl
                    componentclass='checkbox'
                    name="hasCtax"
                    checked={trDoc.hasCtax}
                    onChange={(e: any) => {
                      setTrDocWrapper({ hasCtax: !trDoc.hasCtax });
                    }}
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>{__('handle ctax')}</ControlLabel>
                  <FormControl
                    componentclass='checkbox'
                    name="isHandleCtax"
                    checked={trDoc.isHandleCtax}
                    onChange={(e: any) => {
                      setTrDocWrapper({ isHandleCtax: e.target.checked });
                    }}
                  />
                </FormGroup>
              </FormColumn>
            </FormWrapper>

          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Ctax Row')}</ControlLabel>
              <SelectCtaxRow
                multi={false}
                initialValue={trDoc.ctaxRowId || ''}
                label='Ctax Row'
                name='ctaxRowId'
                onSelect={(ctaxRowId, obj) => onCtaxRowChange(ctaxRowId as string, obj)}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Amount')}</ControlLabel>
              <FormControl
                type='number'
                name="ctaxAmount"
                value={
                  trDoc.isHandleCtax ? trDoc.ctaxAmount : (
                    isWithTax ?
                      sumCtaxAmount / (100 + sumPercent) * (trDoc.ctaxRow?.percent || 0) :
                      sumCtaxAmount / 100 * (trDoc.ctaxRow?.percent || 0) || 0
                  )
                }
                disabled={!trDoc.isHandleCtax}
                onChange={e => setTrDocWrapper({ ctaxAmount: (e.target as any).value })}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
          </FormColumn>
          <FormColumn>

          </FormColumn>
          <FormColumn>
          </FormColumn>
        </FormWrapper>
      </>
    )
  }

  return (
    <>
      {renderVat()}
      {renderCtax()}
    </>
  );
}

export default TaxFields;