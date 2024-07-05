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