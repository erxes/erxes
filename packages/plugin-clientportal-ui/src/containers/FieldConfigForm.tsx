import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { queries, mutations } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import FieldConfigForm from '../components/FieldConfigForm';

type Props = {
  field: IField;
  isSubmitted: boolean;
};

export type FieldConfig = {
  fieldId: string;
  allowedClientPortalIds: string[];
  requiredOn: string[];
};

function Container(props: Props) {
  const { field } = props;
  if (!field) {
    return null;
  }

  if (field.contentType !== 'clientportal:user') {
    return null;
  }

  const { data, loading } = useQuery(gql(queries.fieldConfig), {
    variables: { fieldId: field._id }
  });

  const clientportalsQuery = useQuery(gql(queries.getConfigs), {
    variables: { page: 1, perPage: 100 }
  });

  const [editFieldConfig] = useMutation(gql(mutations.editFields), {
    variables: {
      fieldId: field._id,
      allowedClientPortalIds: [],
      requiredOn: []
    }
  });

  if (loading || clientportalsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const clientPortals = clientportalsQuery.data.clientPortalGetConfigs || [];

  const onChange = (value: any) => {
    editFieldConfig({
      variables: {
        fieldId: field._id,
        allowedClientPortalIds: value.allowedClientPortalIds,
        requiredOn: value.requiredOn
      }
    });
  };

  return (
    <FieldConfigForm
      {...props}
      onChange={onChange}
      fieldConfig={data.clientPortalFieldConfig as FieldConfig}
      clientPortals={clientPortals}
    />
  );
}

export default Container;
