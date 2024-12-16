import React from 'react';

import { queries } from '@erxes/ui-leads/src/graphql';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { ControlLabel } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';

type Props = {
  type: string;
  config: any;
  onChangeConfig?: (value) => void;
};

export default function Form({ config, onChangeConfig }: Props) {
  return (
    <FormGroup>
      <ControlLabel>Form</ControlLabel>
      <SelectWithSearch
        name="formId"
        label="Form"
        initialValue={config.formId}
        queryName="integrations"
        customQuery={queries.integrations}
        filterParams={{ kind: 'lead', perPage: 1000 }}
        generateOptions={array => {
          if (!config.formId && !!array?.length) {
            const { form = {} } = (array || [])[0] || {};
            onChangeConfig && onChangeConfig({ formId: form?._id });
          }
          return array.map(item => ({
            label: item.name,
            value: item?.form?._id,
          }));
        }}
        onSelect={value => {
          onChangeConfig && onChangeConfig({ formId: value });
        }}
      />
    </FormGroup>
  );
}
