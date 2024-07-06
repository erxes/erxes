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
import SelectVatRow from '../../../settings/vatRows/containers/SelectVatRow';

type Props = {
  configsMap: IConfigsMap;
  trDoc: ITransaction;
  setTrDoc: (trDoc: ITransaction) => void;
  onChangeDetail: (key: string, value: any) => void;
};

const VatFields = (props: Props) => {
  const { trDoc, setTrDoc, onChangeDetail, configsMap } = props;
  const detail = trDoc?.details && trDoc?.details[0] || {};

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
              onSelect={(vatRowId) => setTrDoc({ ...trDoc, vatRowId: vatRowId as string })}
            />
          </FormGroup>
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__('Amount')}</ControlLabel>
            <FormControl
              type='number'
              name="amount"
              value={detail.amount || 0}
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

export default VatFields;