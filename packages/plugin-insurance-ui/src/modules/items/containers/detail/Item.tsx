import React from 'react';

import { gql, useQuery } from '@apollo/client';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { InsuranceItem } from '../../../../gql/types';
import Component from '../../components/detail/sections/Item';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  item: InsuranceItem;
  children?: React.ReactNode;
};

const Item = (props: Props) => {
  const { data, loading } = useQuery(gql(fieldQueries.fieldsGroups), {
    variables: {
      contentType: 'insurance:product',
      isDefinedByErxes: false,
    },
    skip: !isEnabled('forms') ? true : false,
  });

  if (loading) {
    return <Spinner />;
  }

  return <Component {...props} fieldsGroups={data?.fieldsGroups} />;
};

export default Item;
