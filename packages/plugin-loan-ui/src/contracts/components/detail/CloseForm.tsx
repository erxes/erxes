import {
  __,
  Button,
  ControlLabel,
  DateControl,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  SelectTeamMembers
} from '@erxes/ui/src';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import Select from 'react-select-plus';
import { WEEKENDS } from '../../../constants';
import { ChangeAmount } from '../../styles';
import { ICloseInfo, IContract, IContractDoc } from '../../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contract: IContract;
  closeInfo: ICloseInfo;
  onChangeDate: (date: Date) => void;
  closeModal: () => void;
  closeDate: Date;
};

type State = {
  closeType: string;
  description: string;
};

class CloseForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      closeType: '',
      description: ''
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
      ...this.state,
      description: this.state.description,
      closeDate: this.props.closeDate,
      closeType: this.state.closeType
    };
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel required={!label.includes('Amount')}>
          {label}
        </ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  onChangeField = e => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    this.setState({ [name]: value } as unknown);
  };

  onFieldClick = e => {
    e.target.select();
  };

  renderRow = (label, fieldName) => {
    const { closeInfo } = this.props;
    const value = closeInfo[fieldName] || 0;
    return (
      <FormWrapper>
        <FormColumn>
          <ChangeAmount>
            <ControlLabel>{`${label}`}</ControlLabel>
          </ChangeAmount>
        </FormColumn>
        <FormColumn>
          <ChangeAmount>{Number(value).toLocaleString()}</ChangeAmount>
        </FormColumn>
      </FormWrapper>
    );
  };
  renderCloseInfo = () => {
    return (
      <>
        {this.renderRow(__('total'), 'total')}
        {this.renderRow(__('payment'), 'payment')}
        {this.renderRow(__('interest'), 'interest')}
        {this.renderRow(__('undue'), 'undue')}
        {this.renderRow(__('insurance'), 'insurance')}
        {this.renderRow(__('debt'), 'debt')}
      </>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const contract = this.props.contract || ({} as IContract);
    const { closeModal, renderButton, onChangeDate } = this.props;
    const { values, isSubmitted } = formProps;

    const onChangeCloseDate = value => {
      onChangeDate(value);
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Close Date')}</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="closeDate"
                    value={this.props.closeDate}
                    onChange={onChangeCloseDate}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Close Type')}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="closeType"
                  componentClass="select"
                  value={this.state.closeType}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {['value0', 'changeCondition', 'cantPay'].map(
                    (typeName, index) => (
                      <option key={index} value={typeName}>
                        {typeName}
                      </option>
                    )
                  )}
                </FormControl>
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  {...formProps}
                  max={140}
                  name="description"
                  componentClass="textarea"
                  value={this.state.description || ''}
                  onChange={this.onChangeField}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          {this.renderCloseInfo()}
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
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

export default CloseForm;
