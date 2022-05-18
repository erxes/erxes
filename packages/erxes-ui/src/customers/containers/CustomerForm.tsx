import { AppConsumer } from '../../appContext';
import { IUser } from '../../auth/types';
import ButtonMutate from '../../components/ButtonMutate';
import { IButtonMutateProps, IQueryParams, IRouterProps } from '../../types';
import { ICustomer } from '../../customers/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';
import { mutations, queries } from '../graphql';
import {
  PropertyConsumer,
  PropertyProvider
} from '@erxes/ui-contacts/src/customers/propertyContext';
import { IFieldsVisibility } from '@erxes/ui-contacts/src/customers/types';

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
              {({ customerVisibilityInDetail }) => {
                return (
                  <CustomerForm
                    {...updatedProps}
                    currentUser={currentUser || ({} as IUser)}
                    autoCompletionQuery={queries.customers}
                    fieldsVisibility={customerVisibilityInDetail}
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
