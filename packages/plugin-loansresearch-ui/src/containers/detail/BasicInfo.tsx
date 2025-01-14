import { Alert } from '@erxes/ui/src';
import { ILoanResearch, RemoveMutationResponse } from '../../types';
import { mutations } from '../../graphql';

import BasicInfoSection from '../../components/detail/BasicInfoSection';
import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

type Props = {
  loansResearch: ILoanResearch;
};

const BasicInfoContainer = (props: Props) => {
  const { loansResearch } = props;
  const navigate = useNavigate();

  const [carsRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.loansResearchRemove),
    {
      refetchQueries: ['loansResearchMain', 'loansResearchDetail'],
    }
  );

  const { _id } = loansResearch;

  const remove = () => {
    carsRemove({ variables: { loanResearchIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a loans data');
        navigate('/loansresearch');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
  };

  return <BasicInfoSection {...updatedProps} />;
};

export default BasicInfoContainer;
