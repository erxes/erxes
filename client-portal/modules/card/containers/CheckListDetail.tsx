import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { queries } from '../graphql';
import { Config } from '../../types';
import CheckList from '../components/CheckListDetail';
import Spinner from '../../common/Spinner';
import { getType } from '../../common/utils';

type Props = {
  checklist: any;
  config: Config;
  type: string
};
function CheckListDetail({ checklist, config, type }: Props) {
  const { data, loading } = useQuery(gql(queries[`${type}ChecklistDetail`]), {
    variables: { _id: checklist._id },
    skip: !checklist,
    context: {
      headers: {
        'erxes-app-token': config?.erxesAppToken
      }
    }
  });

  if (loading) {
    return <Spinner />;
  }

  return <CheckList checklist={data[`${getType(type)}sChecklistDetail`]} />;
}

export default CheckListDetail;
