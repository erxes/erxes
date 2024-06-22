import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { IField } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils/core";
import React from "react";
import Select from "react-select";
import Info from "@erxes/ui/src/components/Info";

type Props = {
  field?: IField;
  fields: IField[];
  onChange: (field: any) => void;
};

const GroupedField = (props: Props) => {
  const { field } = props;
  const [subFieldIds, setSubFieldIds] = React.useState<string[]>(
    field?.subFieldIds || []
  );

  const otherFields = props.fields.filter((f) => {
    if (f.type === "parentField") {
      return false;
    }

    if (f._id === field?._id) {
      return false;
    }

    return true;
  });

  if (otherFields.length === 0) {
    return <p>There are no fields yet.</p>;
  }

  React.useEffect(() => {
    if (props.field) {
      setSubFieldIds(props.field.subFieldIds || []);
    }
  }, [props.field]);

  const options = otherFields.map((f) => ({ label: f.text, value: f._id }));

  return (
    <FormGroup>
      <ControlLabel>Fields</ControlLabel>
      <p>{__("Please select a subfields")}</p>
      <Info>
        {__(
          "Note: If subfields have logics, they will be ignored. But main field logics will be applied."
        )}
      </Info>
      <Select
        placeholder={__("Choose")}
        options={options}
        onChange={(values: any) => {
          props.onChange({
            ...field,
            subFieldIds: values.map((v) => v.value),
          });
        }}
        isClearable={true}
        value={options.filter((option) => subFieldIds.includes(option.value))}
        isMulti={true}
      />
    </FormGroup>
  );
};

export default GroupedField;
