import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { queries } from '../graphql';
import { capitalize } from 'lodash';

type Props = {
  type: string;
};

const CalendarColumn = ({ type }: Props) => {
  const { data, loading: cardQueryLoading } = useQuery(
    gql(queries[`clientPortal${capitalize(type)}`]),
    {
      variables: { _id, clientPortalCard: true },
      skip: !_id,
      context: {
        headers: {
          'erxes-app-token': props.config?.erxesAppToken
        }
      }
    }
  );
};

export default CalendarColumn;
