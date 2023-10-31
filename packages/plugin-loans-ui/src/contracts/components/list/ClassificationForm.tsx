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

function addClassification(
  classification,
  newClassification,
  list,
  currentItem
) {
  const currentType = list.find(
    a =>
      a.classification === classification &&
      a.newClassification === newClassification
  );
  if (currentItem.classification === newClassification) return;
  if (!currentType) {
    list.push({
      classification,
      newClassification,
      list: [
        {
          contractId: currentItem._id,
          amount: currentItem.amount,
          ...currentItem
        }
      ]
    });
  } else {
    currentType.list.push({
      contractId: currentItem._id,
      amount: currentItem.amount,
      ...currentItem
    });
  }
}

function generateList(contractTypes, contracts) {
  let dataClassifications: any = [];

  contractTypes?.map(type => {
    const currentContracts = contracts?.filter(
      a => a.contractTypeId === type._id
    );
    currentContracts.map(contract => {
      let newClassification = 'NORMAL';

      if (type.config.badExpirationDay < (contract.expiredDays || 0))
        newClassification = 'BAD';
      else if (type.config.negativeExpirationDay < (contract.expiredDays || 0))
        newClassification = 'NEGATIVE';
      else if (type.config.doubtExpirationDay < (contract.expiredDays || 0))
        newClassification = 'DOUBTFUL';
      else if (type.config.expiredExpirationDay < (contract.expiredDays || 0))
        newClassification = 'EXPIRED';

      addClassification(
        contract.classification,
        newClassification,
        dataClassifications,
        contract
      );
    });
  });

  return dataClassifications;
}

class ClassificationForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      invDate: new Date(),
      classificationChangeList: generateList(
        this.props.contractTypes,
        this.props.contracts
      )
    };
  }

  generateDoc = () => {
    return (
      this.state.classificationChangeList?.map(mur => ({
        description: `${mur.classification}->${mur.newClassification}`,
        invDate: this.state.invDate,
        total: mur.list.reduce((a, b) => a + b.loanBalanceAmount, 0),
        classification: mur.classification,
        newClassification: mur.newClassification,
        dtl: mur.list?.map(a => ({
          amount: a.loanBalanceAmount,
          contractId: a._id,
          currency: a.currency
        }))
      })) || []
    );
  };

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (
      this.props.contractTypes?.length > 0 &&
      this.props.contracts?.length > 0 &&
      prevProps.contractTypes?.length !== this.props.contractTypes?.length &&
      prevProps.contracts?.length !== this.props.contracts?.length
    ) {
    }
  }

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
            <th>{__('classification')}</th>
            <th>{__('expiredDays')}</th>
            <th>{__('amount')}</th>
            <th>{__('new classification')}</th>
          </tr>
        </thead>
        {this.state.classificationChangeList.map((a, cIndex) => {
          return (
            <tbody
              style={{
                boxShadow: '1px 0px 5px rgba(0,0,0,0.1)',
                columnSpan: 'all'
              }}
            >
              <tr style={{ columnSpan: 'all' }}>
                <label style={{ fontWeight: 700, marginLeft: 20 }}>
                  {a.classification} {`-->`} {a.newClassification}
                </label>
              </tr>
              {a.list.map((mur, index) => {
                return (
                  <tr>
                    <td style={{ fontSize: 'bold' }}>{mur.number}</td>
                    <td>{mur.classification}</td>
                    <td>{mur.expiredDays}</td>
                    <td>{mur.loanBalanceAmount?.toLocaleString()}</td>
                    <td>
                      <select
                        style={{ border: 'none' }}
                        value={a.newClassification}
                        onChange={e => {
                          let dataClassifications = this.state
                            .classificationChangeList;
                          let insertDataType = dataClassifications.find(
                            a =>
                              a.classification === mur.classification &&
                              e.target.value === a.newClassification
                          );
                          if (insertDataType) {
                            insertDataType.list.push({
                              ...mur,
                              newClassification: e.target.value
                            });
                          } else {
                            addClassification(
                              mur.classification,
                              e.target.value,
                              dataClassifications,
                              { ...mur, newClassification: e.target.value }
                            );
                          }
                          a.list.splice(index, 1);
                          if (a.list.length === 0)
                            dataClassifications.splice(cIndex, 1);

                          this.setState({
                            classificationChangeList: dataClassifications
                          });
                        }}
                      >
                        <option>NORMAL</option>
                        <option>EXPIRED</option>
                        <option>DOUBTFUL</option>
                        <option>NEGATIVE</option>
                        <option>BAD</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td
                  colSpan={3}
                  style={{ textAlign: 'right', fontWeight: 'bold' }}
                >
                  Total:
                </td>
                <td>
                  {a.list
                    .reduce((a, b) => a + b.loanBalanceAmount, 0)
                    ?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          );
        })}
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

export default ClassificationForm;
