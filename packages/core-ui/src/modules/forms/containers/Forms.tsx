import Spinner from '@erxes/ui/src/components/Spinner';
import Component from '../components/Forms';
import { gql } from '@apollo/client';
import React from 'react';
import { useQuery } from '@apollo/client';

import queries from '../queries';

const Forms = () => {
  const { data, loading } = useQuery(gql(queries.formsGetContentTypes));

  if (loading) {
    return <Spinner objective={true} />;
  }

  const formTypes = data ? data.formsGetContentTypes || [] : [];

  return <Component formTypes={formTypes} />;
};

export default Forms;
