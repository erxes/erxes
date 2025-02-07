import { gql, useQuery, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { Alert, Spinner } from '@erxes/ui/src';
import BranchEditComponent from '../components/BranchEdit';

import { IPmsBranch } from '../types';
import { mutations, queries } from '../graphql';
import { useNavigate } from 'react-router-dom';

type Props = {
  pmsId?: string;
  queryParams: any;
};

const BranchEdit = (props: Props) => {
  const { pmsId } = props;
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);

  const branchDetailQuery = useQuery(gql(queries.tmsBranchDetail), {
    skip: !pmsId,
    fetchPolicy: 'cache-and-network',
    variables: {
      _id: pmsId || ''
    }
  });

  const [addBranchMutation] = useMutation(gql(mutations.tmsBranchAdd));
  const [editBranchMutation] = useMutation(gql(mutations.tmsBranchEdit));

  const save = doc => {
    setLoading(true);

    const saveMutation = pmsId ? editBranchMutation : addBranchMutation;

    saveMutation({
      variables: {
        _id: pmsId,
        ...doc
      }
    })
      .then(data => {})
      .then(() => {
        Alert.success('You successfully updated a branch');

        navigate({
          pathname: `/pms`,
          search: '?refetchList=true'
        });
      })

      .catch(error => {
        Alert.error(error.message);

        setLoading(false);
      });
  };

  const branch =
    (branchDetailQuery && branchDetailQuery?.data?.tmsBranchDetail) ||
    ({} as IPmsBranch);

  const updatedProps = {
    ...props,
    branch,
    save,
    isActionLoading: loading
  };

  return <BranchEditComponent {...updatedProps} />;
};

export default BranchEdit;
