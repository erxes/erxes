import { IDepartment, IUnit } from '@erxes/ui/src/team/types';

import Form from '../../components/unit/Form';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { queries } from '@erxes/ui/src/team/graphql';
import { useQuery } from '@apollo/client';

type Props = {
  item?: IUnit;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const FormContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.departments), {
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <Form departments={data.departments || ([] as IDepartment[])} {...props} />
  );
};

export default FormContainer;
