import React from 'react';
import { gql } from '@apollo/client';
import { queries } from '@erxes/ui-cards/src/boards/graphql';
import { useQuery } from '@apollo/client';
import Select from 'react-select-plus';
import { FormGroup, ControlLabel, __, BarItems, Icon } from '@erxes/ui/src';
import { Card } from './styles';

export function SelectStage({
  pipelineId,
  initialValue,
  label,
  name,
  excludeIds,
  onSelect
}: {
  pipelineId: string;
  initialValue?: string;
  label: string;
  name: string;
  excludeIds?: string[];
  onSelect: (props: { value: string }) => void;
}) {
  const queryVariables: any = { pipelineId };

  if (!!excludeIds?.length) {
    queryVariables.excludeIds = excludeIds;
  }

  const { data, loading } = useQuery(gql(queries.stages), {
    variables: queryVariables,
    fetchPolicy: 'network-only',
    skip: !pipelineId
  });

  const options = (data?.stages || []).map(stage => ({
    value: stage._id,
    label: stage.name
  }));

  return (
    <FormGroup>
      <ControlLabel required>{__(label)}</ControlLabel>
      <Select
        isRequired={true}
        name={name}
        placeholder={'Choose a stage'}
        value={initialValue}
        onChange={onSelect}
        options={options}
        isLoading={loading}
      />
    </FormGroup>
  );
}

export function SelectCardType({ type, handleSelect, params }) {
  const options = [
    { value: 'deal', label: 'Deal', icon: 'piggy-bank' },
    { value: 'task', label: 'Task', icon: 'file-check-alt' },
    { value: 'ticket', label: 'Ticket', icon: 'ticket' }
  ].filter(option => option.value !== type);

  return (
    <BarItems>
      {options.map(option => {
        return (
          <Card
            key={option.value}
            className={params['type'] === option.value ? 'active' : ''}
            onClick={() => handleSelect({ value: option.value })}
          >
            <Icon icon={option.icon} />
            <ControlLabel>{option.label}</ControlLabel>
          </Card>
        );
      })}
    </BarItems>
  );
}
