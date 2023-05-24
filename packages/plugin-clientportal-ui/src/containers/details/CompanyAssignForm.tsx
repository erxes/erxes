import { IButtonMutateProps } from '@erxes/ui/src/types';
import { CompaniesMainQueryResponse, IClientPortalUser } from '../../types';
import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withProps } from '@erxes/ui/src/utils';

import * as compose from 'lodash.flowright';

import { mutations, queries } from '../../graphql';
import CompanyAssignForm from '../../components/detail/CompanyAssignForm';
import { ButtonMutate, Spinner } from '@erxes/ui/src';
import { queries as companyQueries } from '@erxes/ui-contacts/src/companies/graphql';

type Props = {
  queryParams?: any;
  clientPortalUser: IClientPortalUser;
  closeModal?: () => void;
};

type FinalProps = {
  companiesMainQuery: CompaniesMainQueryResponse;
} & Props;

class FormContainer extends React.Component<FinalProps> {
  renderButton = ({ values, isSubmitted, callback }: IButtonMutateProps) => {
    const callBackResponse = () => {
      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={mutations.changeVerificationStatus}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully updated a clientportal user.`}
        refetchQueries={['clientPortalUserDetail']}
      />
    );
  };

  render() {
    if (this.props.companiesMainQuery.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      companies: this.props.companiesMainQuery.companies || []
    };
    return (
      <CompanyAssignForm {...updatedProps} renderButton={this.renderButton} />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, CompaniesMainQueryResponse>(gql(companyQueries.companies), {
      name: 'companiesMainQuery',
      options: ({ queryParams }) => ({
        variables: { searchValue: queryParams.searchValue }
      })
    })
    // graphql(gql(mutations.clientPortalUserAssignCompany), {
    //   name:'ass'
    //   options: ({ queryParams }) => ({
    //     variables: { searchValue: queryParams.searchValue }
    //   })
    // })
  )(FormContainer)
);
