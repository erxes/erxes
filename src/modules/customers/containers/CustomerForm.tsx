import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import {
  IButtonMutateProps,
  IQueryParams,
  IRouterProps
} from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { AddMutationResponse, ICustomer } from 'modules/customers/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import CustomerForm from '../components/list/CustomerForm';
import { mutations } from '../graphql';

type Props = {
  customer: ICustomer;
  closeModal: () => void;
  queryParams: IQueryParams;
};

type FinalProps = {} & Props & AddMutationResponse & IRouterProps;

const CustomerFormContainer = (props: FinalProps) => {
  // const { customersAdd, history } = props;

  const addCustomers = variables => {
    // tslint:disable-next-line:no-console
    console.log('addCustom', variables);
    Alert.success('YoYo');

    // customersAdd({
    //   variables
    // })
    //   .then((result: any) => {
    //     Alert.success('You successfully added a customer');
    //     // tslint:disable-next-line:no-console
    //     console.log(result);
    //     history.push(
    //       `/contacts/customers/details/${result.data.customersAdd._id}`
    //     );
    //   })
    //   .catch(e => {
    //     Alert.error(e.message);
    //   });
  };

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
    renderButton,
    addCustomers
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

export default withProps<Props>(
  compose(
    graphql<Props, AddMutationResponse, {}>(gql(mutations.customersAdd), {
      name: 'customersAdd'
    })
  )(withRouter<FinalProps>(CustomerFormContainer))
);
