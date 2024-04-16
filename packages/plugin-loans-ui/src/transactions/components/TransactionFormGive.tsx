import * as path from 'path';

import {
  Button,
  ControlLabel,
  DateControl,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ITransaction } from '../types';

import { Amount } from '../../contracts/styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IInvoice } from '../../invoices/types';
import React, { useMemo, useState } from 'react';
import { __ } from 'coreui/utils';
import SelectContracts, {
  Contracts
} from '../../contracts/components/common/SelectContract';
import TextDivider from "@erxes/ui/src/components/TextDivider";

import { IContract } from '../../contracts/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  transaction: ITransaction;
  invoice?: IInvoice;
  type: string;
  closeModal: () => void;
  contractId?: string;
};

type State = {
  contractId: string;
  companyId: string;
  customerId: string;
  invoiceId: string;
  invoice?: IInvoice;
  payDate: Date;
  description: string;
  total: number;
  paymentInfo: any;
  isGetEBarimt?: boolean;
  isOrganization?: boolean;
  organizationRegister?: string;
  organizationName?: string;
  storedInterest: number;
  isPrePayment?: boolean;
};

function TransactionFormGive(props: Props) {
  const [contract, setContract] = useState<IContract | undefined>();
  const [contractId, setContractId] = useState<string>();
  const [payDate, setPayDate] = useState(new Date());
  const [description, setDescription] = useState<string>('');
  const [total, setTotal] = useState(0);

  const maxAmount = useMemo(()=>{
    if(!contract) return 0
    return contract.leaseAmount - contract.givenAmount
  },[contract])

  const doc = useMemo(() => {
    return {
      transactionType: props.type,
      isManual: true,
      payDate,
      total,
      contractId,
    };
  }, [
    contract,
    total,
    description,
    contractId,
    payDate
  ]);

  const renderRowTr = (label, key, value?:any) => {

    if ((!contract || !key || !contract?.[key]) && !value) return '';

    return (
      <FormWrapper>
        <FormColumn>
          <ControlLabel>{`${__(label)}:`}</ControlLabel>
        </FormColumn>
        <FormColumn>
          <Amount>{Number(value || contract?.[key]).toLocaleString()}</Amount>
        </FormColumn>
      </FormWrapper>
    );
  };

  return (
    <Form
      renderContent={({ isSubmitted }: IFormProps) => 
        <>
          <ScrollWrapper>
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>{__('Pay Date')}</ControlLabel>
                  <DateContainer>
                    <DateControl
                      required={false}
                      name="payDate"
                      dateFormat="YYYY/MM/DD"
                      value={payDate}
                      onChange={(v:any)=>setPayDate(v)}
                    />
                  </DateContainer>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>{__('Contract')}</ControlLabel>
                  <SelectContracts
                    label={__('Choose an contract')}
                    name="contractId"
                    initialValue={contractId}
                    onSelect={(v) => {
                      if (typeof v === 'string') {
                        setContractId(v);
                        setContract(Contracts[v]);
                      }
                    }}
                    multi={false}
                  />
                </FormGroup>
                
                {contract && <>
                  <FormWrapper>
                    <FormColumn>
                      <ControlLabel>{__('Type')}</ControlLabel>
                    </FormColumn>
                    <FormColumn>
                      <ControlLabel>Amount</ControlLabel>
                    </FormColumn>
                  </FormWrapper>
                  {renderRowTr('Loan amount', 'leaseAmount')}
                  {renderRowTr('Given amount', 'givenAmount')}
                  {renderRowTr('must give amount', 'mustGive',maxAmount)}
                </>}
                <TextDivider text="Олголтын дүн"  date={new Date()}/>
                <FormColumn>
                  <ControlLabel>{__('Transaction amount')}</ControlLabel>
                  <FormControl
                    type={'number'}
                    useNumberFormat
                    fixed={2}
                    name="total"
                    max={maxAmount}
                    value={total.toString()}
                    onChange={(e:any)=>setTotal(Number(e.target.value))}
                    onDoubleClick={()=>setTotal(maxAmount)}
                  />
                </FormColumn>
                <FormGroup>
                  <ControlLabel>{__('Description')}</ControlLabel>
                  <DateContainer>
                    <FormControl
                      required={false}
                      name="description"
                      value={description}
                      onChange={(e:any) => setDescription(e.target.value)}
                    />
                  </DateContainer>
                </FormGroup>
                
              </FormColumn>
            </FormWrapper>
          </ScrollWrapper>

          <ModalFooter>
            <Button
              btnStyle="simple"
              onClick={props.closeModal}
              icon="cancel-1"
            >
              {__('Close')}
            </Button>

            {props.renderButton({
              name: 'transaction',
              values: doc,
              isSubmitted,
              object: props.transaction
            })}
          </ModalFooter>
        </>
      }
    />
  );
}

export default TransactionFormGive;
