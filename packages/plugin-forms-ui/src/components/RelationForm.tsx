import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';

type Props = {
  contentType: string;
  fields: IField[];
  onChange: (ids: string[], relationType: string) => void;
};

const RelationForm = (props: Props) => {
  const fields = props.fields;
  return (
    <>
      {fields.map(field =>
        loadDynamicComponent(
          'selectRelation',
          {
            ...props,
            field
          },
          true
        )
      )}
    </>
  );
};

export default RelationForm;
