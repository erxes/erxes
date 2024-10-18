import React from "react";
import { gql } from "@apollo/client";
import { queries as ticketsQueries } from "@erxes/ui-tickets/src/boards/graphql";
import { queries as tasksQueries } from '@erxes/ui-tasks/src/boards/graphql';
import { queries as dealsQueries } from '@erxes/ui-sales/src/boards/graphql';
import { useQuery } from "@apollo/client";
import Select from "react-select";
import { FormGroup, ControlLabel, __, BarItems, Icon } from "@erxes/ui/src";
import { Card } from "./styles";

const stageQueries = {
  ticket: ticketsQueries.stages,
  task: tasksQueries.stages,
  deal: dealsQueries.stages,
};

export function SelectStage({
  cardType,
  pipelineId,
  initialValue,
  label,
  name,
  excludeIds,
  onSelect,
}: {
  cardType: keyof typeof stageQueries;
  pipelineId: string;
  initialValue?: string;
  label: string;
  name: string;
  excludeIds?: string[];
  onSelect: (props: { value: string }) => void;
}) {
  const query = stageQueries[cardType];
  const queryVariables: any = { pipelineId };

  if (!!excludeIds?.length) {
    queryVariables.excludeIds = excludeIds;
  }

  const { data, loading } = useQuery(gql(query), {
    variables: queryVariables,
    fetchPolicy: 'network-only',
    skip: !pipelineId,
  });

  const options = ((data || {})[`${cardType}sStages`] || []).map((stage) => ({
    value: stage._id,
    label: stage.name,
  }));

  return (
    <FormGroup>
      <ControlLabel required>{__(label)}</ControlLabel>
      <Select
        required={true}
        name={name}
        placeholder={__('Choose a stage')}
        value={options.find((o) => o.value === initialValue)}
        onChange={onSelect}
        options={options}
        isLoading={loading}
      />
    </FormGroup>
  );
}

export function SelectCardType({ type, handleSelect, params }) {
  const options = [
    { value: "deal", label: "Deal", icon: "piggy-bank" },
    { value: "task", label: "Task", icon: "file-check-alt" },
    { value: "ticket", label: "Ticket", icon: "ticket" },
  ].filter((option) => option.value !== type);

  return (
    <BarItems>
      {options.map((option) => {
        return (
          <Card
            key={option.value}
            className={params["type"] === option.value ? "active" : ""}
            onClick={() =>
              handleSelect({ ...params, value: option.value }, "params")
            }
          >
            <Icon icon={option.icon} />
            <ControlLabel>{option.label}</ControlLabel>
          </Card>
        );
      })}
    </BarItems>
  );
}
