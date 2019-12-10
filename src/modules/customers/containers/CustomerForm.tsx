import ButtonMutate from 'modules/common/components/ButtonMutate';
import {
  IButtonMutateProps,
  IQueryParams,
  IRouterProps
} from 'modules/common/types';
import { ICustomer } from 'modules/customers/types';
import React from 'react';
import { withRouter } from 'react-router';
import CustomerForm from '../components/list/CustomerForm';
import { mutations } from '../graphql';

type Props = {
  customer: ICustomer;
  closeModal: () => void;
  queryParams: IQueryParams;
};

type FinalProps = {} & Props & IRouterProps;

const CustomerFormContainer = (props: FinalProps) => {
  const { history, closeModal } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
    disableLoading
  }: IButtonMutateProps) => {
    const callbackResponse = data => {
      if (disableLoading) {
        return history.push(
          `/contacts/customers/details/${data.customersAdd._id}`
        );
      }

      return closeModal();
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.customersEdit : mutations.customersAdd}
        variables={values}
        callback={callbackResponse}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        disableLoading={disableLoading}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <CustomerForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    'customersMain',
    // customers for company detail associate customers
    'customers',
    'customerCounts'
  ];
};

export default withRouter<FinalProps>(CustomerFormContainer);
