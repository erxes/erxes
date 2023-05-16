import Info from '@erxes/ui/src/components/Info';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IField } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';
import React from 'react';

type Props = {
  contentType: string;
  fields: IField[];
  onChange: (ids: string[], relationType: string) => void;
};

const RelationForm = (props: Props) => {
  const fields = props.fields;

  return (
    <>
      {fields.map(field => (
        <>
          <FormGroup>
            <ControlLabel>{`Select ${field.text}`}</ControlLabel>
            {loadDynamicComponent(
              'selectRelation',
              {
                ...props,
                field
              },
              true
            )}
          </FormGroup>
        </>
      ))}

      <Info>
        <a
          target="_blank"
          href={`/settings/properties?type=${props.contentType}`}
          rel="noopener noreferrer"
        >
          {__(
            'You can configure basic property and relations in properties settings'
          )}
        </a>
      </Info>
    </>
  );
};

export default RelationForm;
