import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  DateControl
} from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import moment from 'moment';
import { IContract } from '../../types';

import { IUser } from '@erxes/ui/src/auth/types';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IContractType } from '../../../contractTypes/types';

type Props = {
  currentUser: IUser;
  contractTypes: IContractType[];
  renderButton: (
    props: IButtonMutateProps & { disabled: boolean }
  ) => JSX.Element;
  contracts: IContract[];
  closeModal: () => void;
};

type State = {
  invDate: Date;
  classificationChangeList: any[];
};

function addClassification(classification, list, currentItem) {
  list.push({
    classification,
    list: [
      {
        contractId: currentItem._id,
        amount: currentItem.amount,
        ...currentItem
      }
    ]
  });
}

function generateList(contractTypes, contracts) {
  let dataClassifications: any = [];

  contractTypes?.map(type => {
    const currentContracts = contracts?.filter(
      a => a.contractTypeId === type._id
    );
    currentContracts.map(contract => {
      addClassification(contract.classification, dataClassifications, contract);
    });
  });

  return dataClassifications;
}

class StoreInterestForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      invDate: new Date(),
      classificationChangeList: this.props.contracts
    };
  }

  generateDoc = () => {
    return [];
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{__(label)}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  onChangeField = e => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    this.setState({ [name]: value } as any);
  };

  checkValidation = (): any => {
    const errors: any = {};

    return errors;
  };

  renderClassificationList = () => {
    return (
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>{__('number')}</th>
            <th>{__('last stored date')}</th>
            <th>{__('days')}</th>
            <th>{__('storing interest')}</th>
          </tr>
        </thead>
        <tbody
          style={{
            boxShadow: '1px 0px 5px rgba(0,0,0,0.1)',
            columnSpan: 'all'
          }}
        >
          {this.state.classificationChangeList.map(mur => {
            return (
              <tr>
                <td style={{ fontSize: 'bold' }}>{mur.number}</td>
                <td>
                  {moment(mur.lastStoredDate || undefined).format('YYYY-MM-DD')}
                </td>
                <td>{mur.expiredDays}</td>
                <td>{mur.interestNounce}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>
                {__('Transaction Date')}
              </ControlLabel>
              <DateContainer>
                <DateControl {...formProps} required={false} name="startDate" />
              </DateContainer>
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <ScrollWrapper>{this.renderClassificationList()}</ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contract',
            values: this.generateDoc(),
            disabled: !!Object.keys(this.checkValidation())?.length,
            isSubmitted,
            object: this.props.contracts
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default StoreInterestForm;
