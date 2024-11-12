import { ControlLabel, FormGroup, Spinner } from "@erxes/ui/src/components";
import { IField, IOption } from "@erxes/ui/src/types";
import React, { useState } from "react";

import Select, { OnChangeValue } from "react-select";
import { gql } from "@apollo/client";
import { queries } from "../../graphql";
import { useQuery } from "@apollo/client";

type Props = {
  pipelineId: string;
  field: IField;
  onChangeField: (name: any, value: any) => void;
};

const GenerateAddFormFields = (props: Props) => {
  const [labelIds, setLabelIds] = useState([] as string[]);
  const { field } = props;

  const { data, loading } = useQuery(gql(queries.pipelineLabels), {
    variables: {
      pipelineId: props.pipelineId
    }
  });

  if (loading) {
    return <Spinner />;
  }

  const onChange = (ops: OnChangeValue<IOption, true>) => {
    props.onChangeField(
      field.field,
      ops.map(option => option.value)
    );

    setLabelIds(ops.map(option => option.value));
  };

  const options: IOption[] = (data.purchasesPipelineLabels || []).map(d => ({
    value: d._id,
    label: d.name
  }));

  return (
    <FormGroup>
      <ControlLabel ignoreTrans={true} required={field.isRequired}>
        {field.text}
      </ControlLabel>
      <Select
        value={options.filter(o => labelIds.includes(o.value))}
        name="labelIds"
        isMulti={true}
        options={options}
        onChange={onChange}
      />
    </FormGroup>
  );
};

export default GenerateAddFormFields;
