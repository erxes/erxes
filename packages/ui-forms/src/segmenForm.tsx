import React from "react";

import { queries } from "@erxes/ui-leads/src/graphql";
import SelectWithSearch from "@erxes/ui/src/components/SelectWithSearch";
import { ControlLabel } from "@erxes/ui/src/components/form";
import FormGroup from "@erxes/ui/src/components/form/Group";

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
        generateOptions={(array) => {
          if (!config.formId) {
            onChangeConfig && onChangeConfig({ formId: array[0].form?._id });
          }
          const ar = array.map((item) => ({
            label: item.name,
            value: item?.form?._id,
          }));
          console.log({ ar });
          return ar;
        }}
        onSelect={(value) => {
          console.log({ formId: value });
          onChangeConfig && onChangeConfig({ formId: value });
        }}
      />
    </FormGroup>
  );
}
