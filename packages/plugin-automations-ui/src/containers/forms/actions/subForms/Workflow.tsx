import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { queries } from '../../../../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import Workflow from '../../../../components/forms/actions/subForms/WorkFlow';
import { IAction } from '@erxes/ui-automations/src/types';

type Props = {
  actionsConst: any[];
  activeAction: IAction;
  addAction: () => void;
  closeModal: () => void;
  onSave: () => void;
  propertyTypesConst: any[];
  triggerType: string;
};

export default function WorkFlow({ triggerType, ...props }: Props) {
  const {
    data = {},
    loading,
    error
  } = useQuery(gql(queries.automations), {
    variables: { triggerTypes: [triggerType] }
  });

  if (loading) {
    return <Spinner objective />;
  }

  const updatedProps = {
    ...props,
    list: data?.automations || []
  };

  return <Workflow {...updatedProps} />;
}
