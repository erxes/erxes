import { AppConsumer } from '../../appContext';
import ButtonMutate from '../../components/ButtonMutate';
import { IButtonMutateProps } from '../../types';
import React from 'react';
import { IUser } from '../../auth/types';
import { UsersQueryResponse } from '../../auth/types';
import CompanyForm from '../components/CompanyForm';
import { mutations, queries } from '../graphql';
import { ICompany } from '../types';

type Props = {
  company: ICompany;
  getAssociatedCompany?: (newCompany: ICompany) => void;
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
    object
  }: IButtonMutateProps) => {
    const { closeModal, getAssociatedCompany } = props;

    const afterSave = data => {
      closeModal();

      if (getAssociatedCompany) {
        getAssociatedCompany(data.companiesAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.companiesEdit : mutations.companiesAdd}
        variables={values}
        callback={afterSave}
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

  return (
    <AppConsumer>
      {({ currentUser }) => (
        <CompanyForm
          {...updatedProps}
          currentUser={currentUser || ({} as IUser)}
          autoCompletionQuery={queries.companies}
        />
      )}
    </AppConsumer>
  );
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
