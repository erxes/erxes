import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import SelectContracts from '../common/SelectContract';
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';

import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import {  IContract, IContractDoc } from '../../types';
import { __ } from 'coreui/utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contract: IContract;
  onChangeDate: (date: Date) => void;
  closeModal: () => void;
  closeDate: Date;
};

type State = {
  closeType: string;
  description: string;
  blockType: string
  amount:number
  scheduleDate: Date
  payDate:Date,
  account:string
};

class BlockForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      closeType: '',
      description: '',
      account:'',
      blockType:'scheduleTransaction',
      amount:0,
      scheduleDate:new Date(),
      payDate:new Date()
    };
  }

  generateDoc = (values: { _id: string } & IContractDoc) => {
    const { contract } = this.props;

    const finalValues = values;

    if (contract) {
      finalValues._id = contract._id;
    }

    return {
      contractId: finalValues._id,
      customerId:contract.customerId,
      ...this.state,
      amount:Number(this.state.amount),
      description: this.state.description,
    };
  };

  onChangeField = e => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    this.setState({ [name]: value } as any);
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const onChangePayDate = value => {
      this.setState({payDate:value});
    };

    const onChangeScheduleDate = value => {
      this.setState({scheduleDate:value});
    };

    return (
      <>
        <ScrollWrapper>
        <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Block Type')}</ControlLabel>
                <FormControl
                  {...this.props}
                  name="blockType"
                  componentclass="select"
                  value={this.state.blockType}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {['scheduleTransaction', 'loanPayment'].map(
                    (typeName, index) => (
                      <option key={typeName} value={typeName}>
                        {__(typeName)}
                      </option>
                    ),
                  )}
                </FormControl>
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Block Date')}</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    dateFormat={'YYYY/MM/DD'}
                    name="payDate"
                    value={this.state.payDate}
                    onChange={onChangePayDate}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormGroup>
                  <ControlLabel>{__('Deposit account')}</ControlLabel>
                  <SelectContracts
                    label={__('Choose an contract')}
                    name="depositAccount"
                    initialValue={this.state.account}
                    filterParams={{ isDeposit: true }}
                    onSelect={(v) => {
                      if (typeof v === 'string') {
                        this.setState({
                          account: v,
                        });
                      }
                    }}
                    multi={false}
                  />
                </FormGroup>
          {this.state.blockType == 'scheduleTransaction' && <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Schedule Date')}</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    dateFormat={'YYYY/MM/DD'}
                    name="scheduleDate"
                    value={this.state.scheduleDate}
                    onChange={onChangeScheduleDate}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>}
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Block Amount')}</ControlLabel>
                <FormControl 
                  className='flex-item'
                  type= 'number'
                  useNumberFormat
                  max={this.props.contract.savingAmount}
                  name ='amount'
                  value={ this.state.amount}
                  onChange={ this.onChangeField}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Description')}</ControlLabel>
                <FormControl
                  {...formProps}
                  max={140}
                  name="description"
                  componentclass="textarea"
                  value={this.state.description || ''}
                  onChange={this.onChangeField}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contract',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.contract
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default BlockForm;
