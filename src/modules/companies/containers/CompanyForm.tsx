import { ButtonMutate } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import { IUser } from '../../auth/types';
import { UsersQueryResponse } from '../../settings/team/types';
import { CompanyForm } from '../components';
import { mutations } from '../graphql';
import { ICompany } from '../types';

type Props = {
  company: ICompany;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
} & Props;

const CompanyFromContainer = (props: FinalProps) => {
  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.companiesEdit : mutations.companiesAdd}
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

  return <CompanyForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    'companiesMain',
    'companyDetail',
    // companies for customer detail company associate
    'companies',
    'companyCounts'
  ];
};

export default CompanyFromContainer;
