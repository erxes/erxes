import React from 'react';
import { gql } from '@apollo/client';
import queries from '../graphql/queries';
import { RequestDetailQueryResponse } from '../../common/type';
import { Spinner } from '@erxes/ui/src';
import { useQuery } from '@apollo/client';
import { IGrantRequest, IGrantResponse } from '../../common/type';

import FormComponent from '../components/Form';

type Props = {
  _id: string;
};

const DetailForm: React.FC<Props> = ({ _id }: Props) => {
  const detailQuery = useQuery<RequestDetailQueryResponse>(
    gql(queries.requestDetail),
    {
      variables: { _id },
      skip: !_id ? true : false,
    },
  );

  if (detailQuery.loading) {
    return <Spinner />;
  }

  const updatedProps = {
    detail:
      (detailQuery.data && detailQuery.data.grantRequestDetail) ||
      ({} as { responses: IGrantResponse[] } & IGrantRequest),
  };


  return <FormComponent {...updatedProps} />;
};

export default DetailForm;
