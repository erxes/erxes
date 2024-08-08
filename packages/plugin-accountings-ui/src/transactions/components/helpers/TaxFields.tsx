import { __ } from '@erxes/ui/src';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  FormColumn,
  FormWrapper
} from "@erxes/ui/src/styles/main";
import React, { useEffect, useMemo, useState } from 'react';
import { IConfigsMap } from '../../../settings/configs/types';
import { ITransaction } from '../../types';
import SelectVatRow from '../../../settings/vatRows/containers/SelectVatRow';
import SelectCtaxRow from '../../../settings/ctaxRows/containers/SelectCtaxRow';
import { IVatRow } from '../../../settings/vatRows/types';
import { ICtaxRow } from '../../../settings/ctaxRows/types';

type Props = {
  configsMap: IConfigsMap;
  trDoc: ITransaction;
  isWithTax?: boolean;
  setTrDoc: (trDoc: ITransaction) => void;
  onChangeDetail: (key: string, value: any) => void;
};

const TaxFields = (props: Props) => {
  const { trDoc, setTrDoc, onChangeDetail, configsMap, isWithTax } = props;

  const sumVatAmount = trDoc?.details.filter(d => !d.excludeVat).reduce((sum, cur) => sum + (cur?.amount || 0), 0);
  const sumCtaxAmount = trDoc?.details.filter(d => !d.excludeCtax).reduce((sum, cur) => sum + (cur?.amount || 0), 0);


  const [sumPercent, setSumPercent] = useState(
    (trDoc.hasVat ? (trDoc.vatRow?.percent || 0) : 0) +
    (trDoc.hasCtax ? (trDoc.ctaxRow?.percent || 0) : 0)
  );

  useEffect(() => {
    setSumPercent(
      (trDoc.hasVat ? (trDoc.vatRow?.percent || 0) : 0) +
      (trDoc.hasCtax ? (trDoc.ctaxRow?.percent || 0) : 0)
    )
  }, [trDoc.vatRowId, trDoc.ctaxRowId, trDoc.hasVat, trDoc.hasCtax]);

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

  console.log(sumVatAmount, sumCtaxAmount, sumPercent)

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
                autoFocus={true}
                required={true}
                onChange={(e: any) => {
                  setTrDoc({ ...trDoc, hasVat: e.target.checked });
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
                    autoFocus={true}
                    required={true}
                    onChange={(e: any) => {
                      setTrDoc({ ...trDoc, hasVat: e.target.checked });
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
                    autoFocus={true}
                    required={true}
                    onChange={(e: any) => {
                      setTrDoc({ ...trDoc, isHandleVat: e.target.checked });
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
                    autoFocus={true}
                    required={true}
                    onChange={(e: any) => {
                      setTrDoc({ ...trDoc, afterVat: e.target.checked });
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
              <ControlLabel required={true}>{__('Amount')}</ControlLabel>
              <FormControl
                type='number'
                name="amount"
                value={
                  isWithTax ?
                    sumVatAmount / (100 + sumPercent) * (trDoc.vatRow?.percent || 0) :
                    sumVatAmount / 100 * (trDoc.vatRow?.percent || 0) || 0
                }
                autoFocus={true}
                required={true}
                disabled={!trDoc.isHandleVat}
                onChange={e => onChangeDetail('amount', (e.target as any).value)}
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
                autoFocus={true}
                required={true}
                onChange={(e: any) => {
                  setTrDoc({ ...trDoc, hasCtax: e.target.checked });
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
                    autoFocus={true}
                    required={true}
                    onChange={(e: any) => {
                      setTrDoc({ ...trDoc, hasCtax: e.target.checked });
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
                    autoFocus={true}
                    required={true}
                    onChange={(e: any) => {
                      setTrDoc({ ...trDoc, isHandleCtax: e.target.checked });
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
                name="amount"
                value={
                  isWithTax ?
                    sumCtaxAmount / (100 + sumPercent) * (trDoc.ctaxRow?.percent || 0) :
                    sumCtaxAmount / 100 * (trDoc.ctaxRow?.percent || 0) || 0
                }
                autoFocus={true}
                required={true}
                disabled={!trDoc.isHandleVat}
                onChange={e => onChangeDetail('amount', (e.target as any).value)}
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