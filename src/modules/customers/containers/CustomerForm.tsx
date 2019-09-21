import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IQueryParams } from 'modules/common/types';
import { ICustomer } from 'modules/customers/types';
import React from 'react';
import CustomerForm from '../components/list/CustomerForm';
import { mutations } from '../graphql';

type Props = {
  customer: ICustomer;
  closeModal: () => void;
  queryParams: IQueryParams;
};

const CustomerFormContainer = (props: Props) => {
  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.customersEdit : mutations.customersAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
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

export default CustomerFormContainer;
