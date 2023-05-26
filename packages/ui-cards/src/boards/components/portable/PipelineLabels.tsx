import { ControlLabel, FormGroup, Spinner } from '@erxes/ui/src/components';
import { IField, IOption } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import { useQuery } from '@apollo/client';
import { queries } from '../../graphql';

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

  const onChange = (ops: IOption[]) => {
    props.onChangeField(
      field.field,
      ops.map(option => option.value)
    );

    setLabelIds(ops.map(option => option.value));
  };

  const options: IOption[] = (data.pipelineLabels || []).map(d => ({
    value: d._id,
    label: d.name
  }));

  return (
    <FormGroup>
      <ControlLabel ignoreTrans={true} required={field.isRequired}>
        {field.text}
      </ControlLabel>
      <Select
        value={labelIds}
        name="labelIds"
        multi={true}
        options={options}
        componentClass="select"
        onChange={onChange}
      />
    </FormGroup>
  );
};

export default GenerateAddFormFields;
