import { AppConsumer } from 'appContext';
import { IUser } from 'modules/auth/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import {
  IButtonMutateProps,
  IQueryParams,
  IRouterProps
} from 'modules/common/types';
import { ICustomer } from 'modules/customers/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import CustomerForm from '../components/list/CustomerForm';
import { mutations, queries } from '../graphql';

type Props = {
  type?: string;
  customer: ICustomer;
  closeModal: () => void;
  getAssociatedCustomer?: (customerId: string) => void;
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
    const { closeModal, type, history, getAssociatedCustomer } = this.props;
    const { redirectType } = this.state;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object,
      resetSubmit
    }: IButtonMutateProps) => {
      const afterSave = data => {
        closeModal();

        if (redirectType === 'detail') {
          return history.push(`/contacts/details/${data.customersAdd._id}`);
        }

        const currentLocation = `${window.location.pathname}${
          window.location.search
          }`;

        if (getAssociatedCustomer) {
          getAssociatedCustomer(data.customersAdd);
        }

        if (redirectType === 'new') {
          history.push(`/contacts`);
          history.replace(`${currentLocation}#showCustomerModal=true`);
        }
      };

      values.state = type || 'customer';

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
          icon="check-circle"
          resetSubmit={resetSubmit}
          uppercase={false}
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

    return (
      <AppConsumer>
        {({ currentUser }) => (
          <CustomerForm
            {...updatedProps}
            currentUser={currentUser || ({} as IUser)}
            autoCompletionQuery={queries.customers}
          />
        )}
      </AppConsumer>
    );
  }
}

const getRefetchQueries = () => {
  return ['customersMain', 'customers', 'customerCounts'];
};

export default withRouter<FinalProps>(CustomerFormContainer);
