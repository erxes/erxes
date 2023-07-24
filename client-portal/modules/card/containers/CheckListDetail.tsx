import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { queries } from '../graphql';
import { Config } from '../../types';
import CheckList from '../components/CheckListDetail';
import Spinner from '../../common/Spinner';

type Props = {
  checklist: any;
  type: string;
  config: Config;
};
function CheckListDetail({ type, checklist, config }: Props) {
  const { data, loading } = useQuery(gql(queries.checklistDetail), {
    variables: { _id: checklist._id },
    skip: type !== 'task',
    context: {
      headers: {
        'erxes-app-token': config?.erxesAppToken
      }
    }
  });

  if (loading) {
    return <Spinner />;
  }

  return <CheckList checklist={data.checklistDetail} />;
}

export default CheckListDetail;
