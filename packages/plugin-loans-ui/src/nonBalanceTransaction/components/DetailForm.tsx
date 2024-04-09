import {
  __,
  ControlLabel,
  Form,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleScrollWrapper as ScrollWrapper,
  CollapseContent,
  Table
} from '@erxes/ui/src';
import React from 'react';
import { INonBalanceTransaction } from '../types';

type Props = {
  nonBalanceTransaction: INonBalanceTransaction;
};
class NonBalanceTransactionForm extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  DetailInfo = () => {
    const { nonBalanceTransaction} = this.props;
    const  nonBalTrDetail = nonBalanceTransaction?.detail || []
    const  title = nonBalanceTransaction.transactionType || ''

    return (
      <>
        <FormWrapper>
          <FormColumn>
              <FormGroup>
                <ControlLabel >Customer:</ControlLabel>
                <ControlLabel >{nonBalanceTransaction.description}</ControlLabel>
              </FormGroup>
          </FormColumn>
      </FormWrapper>
        <CollapseContent title={title} >
        <Table whiteSpace="nowrap" bordered={true} hover={true} striped>
          <thead>
            <tr>
              <th>{__('Detail Type')}</th>
              <th>{__('Amount')}</th>
              <th>{__('Currency')}</th>
            </tr>
          </thead>
          <tbody id="nonBalanceTransactionDetails">
          { nonBalTrDetail.map((item, index) => (
             <tr key={index}>
              <td >{(item && item?.type === 'allInterest') ? 'storedInterest, stoppedInterest' : item?.type || ''}</td>
              <td >{(item && item?.ktAmount > 0) ? item?.ktAmount : item?.dtAmount || ''}</td>
              <td >{(item && item.currency) || ''}</td>
            </tr>
          ))
        } 
        </tbody>
      </Table>
      </CollapseContent>
      </>
    );
  };
  
  render() {
    return <Form renderContent={this.DetailInfo } />;
  }
}

export default NonBalanceTransactionForm;
