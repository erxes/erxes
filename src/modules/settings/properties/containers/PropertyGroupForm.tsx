import gql from 'graphql-tag';
import * as React from 'react';
import { PropertyGroupForm } from '../components';
import { queries } from '../graphql';
import {
  FieldsGroupsEditMutationResponse,
  FieldsGroupsMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  closeModal: () => void;
};

const PropertyGroupFormContainer = (props: Props) => {
  const { queryParams } = props;
  const { type } = queryParams;

  const updatedProps = {
    ...props,
    type,
    refetchQueries: getRefetchQueries(queryParams)
  };

  return <PropertyGroupForm {...updatedProps} />;
};

const getRefetchQueries = queryParams => {
  return [
    {
      query: gql`
        ${queries.fieldsGroups}
      `,
      variables: { contentType: queryParams.type }
    }
  ];
};

export default PropertyGroupFormContainer;
