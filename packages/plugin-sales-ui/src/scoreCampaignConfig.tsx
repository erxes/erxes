import React, { useState, useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import Select from "react-select";
import { __, Button, ControlLabel, FormGroup } from "@erxes/ui/src";
import { FlexRow } from "@erxes/ui-settings/src/styles";
import { queries } from "@erxes/ui-sales/src/boards/graphql";
import { LinkButton } from "@erxes/ui/src/styles/main";

const StageSelector = ({
  index,
  state,
  onChange,
  onRemove,
}: {
  index: number;
  state: any;
  onChange: (state: any, index: number) => void;
  onRemove: (index: number) => void;
}) => {
  const { data: boardsData, loading: boardsLoading } = useQuery(
    gql(queries.boards),
    { variables: { type: "sales" } }
  );

  const { data: pipelinesData, loading: pipelinesLoading } = useQuery(
    gql(queries.pipelines),
    { variables: { boardId: state.boardId }, skip: !state.boardId }
  );

  const { data: stagesData, loading: stagesLoading } = useQuery(
    gql(queries.stages),
    { variables: { pipelineId: state.pipelineId }, skip: !state.pipelineId }
  );

  const boards = useMemo(
    () =>
      (boardsData?.salesBoards || []).map(({ _id, name }) => ({
        label: name,
        value: _id,
      })),
    [boardsData]
  );

  const pipelines = useMemo(
    () =>
      (pipelinesData?.salesPipelines || []).map(({ _id, name }) => ({
        label: name,
        value: _id,
      })),
    [pipelinesData]
  );

  const stages = useMemo(
    () =>
      (stagesData?.salesStages || []).map(({ _id, name }) => ({
        label: name,
        value: _id,
      })),
    [stagesData]
  );

  return (
    <FlexRow>
      <FormGroup>
        <ControlLabel>{__("Board")}</ControlLabel>
        <Select
          id="boards"
          isLoading={boardsLoading}
          value={boards.find(({ value }) => value === state.boardId)}
          options={boards}
          onChange={(selected) =>
            onChange({ ...state, boardId: selected?.value }, index)
          }
          isClearable
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel> {__("Pipeline")}</ControlLabel>
        <Select
          id="pipelines"
          isLoading={pipelinesLoading}
          value={pipelines.find(({ value }) => value === state.pipelineId)}
          options={pipelines}
          onChange={(selected) =>
            onChange({ ...state, pipelineId: selected?.value }, index)
          }
          isClearable
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{__("Stages")}</ControlLabel>
        <Select
          id="stages"
          isLoading={stagesLoading}
          value={stages.filter(({ value }) => state.stageIds?.includes(value))}
          options={stages}
          onChange={(selectedOptions) =>
            onChange(
              {
                ...state,
                stageIds: [
                  ...new Set([
                    ...(selectedOptions?.map(({ value }) => value) || []),
                  ]),
                ],
              },
              index
            )
          }
          isClearable
          isMulti
        />
      </FormGroup>
      <Button
        btnStyle="danger"
        icon="trash-alt"
        onClick={() => onRemove(index)}
      />
    </FlexRow>
  );
};

const ScoreCampaignConfig = ({ onChange, config = [] }) => {
  const [states, setStates] = useState(config?.length ? config : [{}]);

  const handleChange = (updatedState, index) => {
    setStates((prev) => {
      const newStates = [...prev];
      newStates[index] = updatedState;
      onChange(newStates);

      return newStates;
    });
  };

  const handleRemove = (index) => {
    setStates((prev) => prev.filter((_, i) => i !== index));
    onChange(states);
  };

  return (
    <>
      {states.map((state, index) => (
        <StageSelector
          key={index}
          index={index}
          state={state}
          onChange={handleChange}
          onRemove={handleRemove}
        />
      ))}

      <LinkButton onClick={() => setStates((prev) => [...prev, {}])}>
        + Add
      </LinkButton>
    </>
  );
};

export default ScoreCampaignConfig;
