import { mutations, queries } from '../graphql';
import { mutations as conformityMutations } from '@erxes/ui-cards/src/conformity/graphql';

import { AppConsumer } from '@erxes/ui/src/appContext';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import CompanyForm from '../components/CompanyForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ICompany } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';

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
      if (values.relationData && Object.keys(values.relationData).length > 0) {
        const { relationData } = values;

        for (const key in relationData) {
          if (relationData.hasOwnProperty(key)) {
            client.mutate({
              mutation: gql(conformityMutations.conformityEdit),
              variables: {
                mainType: 'company',
                mainTypeId: data.companiesAdd._id,
                relType: key,
                relTypeIds: relationData[key]
              }
            });
          }
        }
      }

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
