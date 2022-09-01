import {
  IButtonMutateProps,
  IQueryParams,
  IRouterProps
} from '@erxes/ui/src/types';
import {
  PropertyConsumer,
  PropertyProvider
} from '@erxes/ui-contacts/src/customers/propertyContext';
import { mutations, queries } from '../graphql';

import { AppConsumer } from '@erxes/ui/src/appContext';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import CustomerForm from '../components/CustomerForm';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IFieldsVisibility } from '@erxes/ui-contacts/src/customers/types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { withRouter } from 'react-router-dom';

type Props = {
  type?: string;
  customer: ICustomer;
  closeModal: () => void;
  getAssociatedCustomer?: (newCustomer: ICustomer) => void;
  queryParams: IQueryParams;
  customerVisibilityInDetail: IFieldsVisibility;
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

        const currentLocation = `${window.location.pathname}${window.location.search}`;

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
          <PropertyProvider>
            <PropertyConsumer>
              {({ customerVisibility }) => {
                return (
                  <CustomerForm
                    {...updatedProps}
                    currentUser={currentUser || ({} as IUser)}
                    autoCompletionQuery={queries.customers}
                    fieldsVisibility={customerVisibility}
                  />
                );
              }}
            </PropertyConsumer>
          </PropertyProvider>
        )}
      </AppConsumer>
    );
  }
}

const getRefetchQueries = () => {
  return ['customersMain', 'customers', 'customerCounts'];
};

export default withRouter<FinalProps>(CustomerFormContainer);
