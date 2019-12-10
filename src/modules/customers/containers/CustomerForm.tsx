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

type State = {
  redirectType?: string;
};

type FinalProps = {} & Props & IRouterProps;
class CustomerFormContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      redirectType: undefined
    };
  }

  changeRedirectType = (redirectType: string) => {
    this.setState({ redirectType });
  };

  render() {
    const { closeModal, history } = this.props;
    const { redirectType } = this.state;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const afterSave = data => {
        closeModal();

        if (redirectType === 'detail') {
          return history.push(
            `/contacts/customers/details/${data.customersAdd._id}`
          );
        }

        const currentLocation = `${window.location.pathname}${
          window.location.search
        }`;

        if (redirectType === 'new') {
          history.push(`/contacts`);
          history.replace(`${currentLocation}#showCustomerModal=true`);
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.customersEdit : mutations.customersAdd}
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          disableLoading={redirectType ? true : false}
          disabled={isSubmitted}
          type="submit"
          icon="user-check"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      changeRedirectType: this.changeRedirectType,
      renderButton
    };

    return <CustomerForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'customersMain',
    // customers for company detail associate customers
    'customers',
    'customerCounts'
  ];
};

export default withRouter<FinalProps>(CustomerFormContainer);
