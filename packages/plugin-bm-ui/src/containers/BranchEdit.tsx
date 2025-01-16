import { gql, useQuery, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { Alert, Spinner } from '@erxes/ui/src';
import BranchEditComponent from '../components/BranchEdit';

import { IBmsBranch } from '../types';
import { mutations, queries } from '../graphql';
import { useNavigate } from 'react-router-dom';
import { IBranch } from '@erxes/ui/src/team/types';

type Props = {
  bmsId?: string;
  queryParams: any;
};

const BranchEdit = (props: Props) => {
  const { bmsId } = props;
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);

  const branchDetailQuery = useQuery(gql(queries.bmsBranchDetail), {
    skip: !bmsId,
    fetchPolicy: 'cache-and-network',
    variables: {
      _id: bmsId || '',
    },
  });

  const [addBranchMutation] = useMutation(gql(mutations.bmsBranchAdd));
  const [editBranchMutation] = useMutation(gql(mutations.bmsBranchEdit));

  const save = doc => {
    setLoading(true);

    const saveMutation = bmsId ? editBranchMutation : addBranchMutation;

    saveMutation({
      variables: {
        _id: bmsId,
        ...doc,
      },
    })
      .then(data => {})
      .then(() => {
        Alert.success('You successfully updated a branch');

        navigate({
          pathname: `/tms`,
          search: '?refetchList=true',
        });
      })

      .catch(error => {
        Alert.error(error.message);

        setLoading(false);
      });
  };

  const branch =
    (branchDetailQuery && branchDetailQuery?.data?.bmsBranchDetail) ||
    ({} as IBranch);

  const updatedProps = {
    ...props,
    branch,
    save,
    isActionLoading: loading,
  };

  return <BranchEditComponent {...updatedProps} />;
};

export default BranchEdit;
