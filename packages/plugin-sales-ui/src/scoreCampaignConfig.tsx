import { gql, useQuery } from "@apollo/client";
import { queries } from "@erxes/ui-sales/src/boards/graphql";
import { FlexRow } from "@erxes/ui-settings/src/styles";
import {
  __,
  Button,
  colors,
  ControlLabel,
  dimensions,
  FormControl,
  FormGroup,
} from "@erxes/ui/src";
import { LinkButton } from "@erxes/ui/src/styles/main";
import React, { useMemo } from "react";
import Select from "react-select";
import styled from "styled-components";

const Block = styled.div`
  border-bottom: 1px dashed ${colors.borderPrimary};
  margin-bottom: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
  padding-bottom: ${dimensions.unitSpacing}px;

  .Select {
    min-width: 300px;
  }

  > h4 {
    margin-bottom: ${dimensions.coreSpacing}px;
    color: ${colors.colorPrimary};
  }
`;

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

  const refundStages = useMemo(() => {
    const selectedStageIds = state.stageIds || []; 
  
    return (stagesData?.salesStages || [])
      .filter(({ _id }) => !selectedStageIds.includes(_id)) 
      .map(({ _id, name }) => ({
        label: name,
        value: _id,
      }));
  }, [stagesData, state.stageIds]);

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
      <FormGroup>
        <ControlLabel>{__("Refund Stages")}</ControlLabel>
        <Select
          id="refundStages"
          isLoading={stagesLoading}
          value={refundStages.filter(({ value }) => state.refundStageIds?.includes(value))}
          options={refundStages}
          onChange={(selectedOptions) =>
            onChange(
              {
                ...state,
                refundStageIds: [
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

const ScoreCampaignConfig = ({ onChange, config }) => {
  const [states, setStates] = React.useState(config?.cardBasedRule || [{}]);

  const handleChange = (updatedState, index) => {
    setStates((prev) => {
      const newStates = [...prev];
      newStates[index] = updatedState;
      onChange({ ...config, cardBasedRule: newStates });

      return newStates;
    });
  };

  const handleRemove = (index) => {
    setStates((prev) => prev.filter((_, i) => i !== index));
    onChange(states);
  };

  return (
    <>
      <Block>
        <h4>{__("Product based rule")}</h4>
        <FormGroup>
          <ControlLabel>{__("Discount check (optional)")}</ControlLabel>
          <FormControl
            componentclass="checkbox"
            checked={config?.discountCheck || false}
            onChange={(e: any) =>
              onChange({ ...config, discountCheck: e.target.checked })
            }
          />
        </FormGroup>
      </Block>

      <Block>
        <h4>{__("Deal based rule")}</h4>
        <FormGroup>
          {states.map((state, index) => (
            <StageSelector
              key={index}
              index={index}
              state={state}
              onChange={handleChange}
              onRemove={handleRemove}
            />
          ))}
        </FormGroup>

        <LinkButton onClick={() => setStates((prev) => [...prev, {}])}>
          + Add
        </LinkButton>
      </Block>
    </>
  );
};

export default ScoreCampaignConfig;
