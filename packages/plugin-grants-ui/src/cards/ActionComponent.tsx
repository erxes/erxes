import React, { useEffect, useState } from "react";
import Attribution from "@erxes/ui-automations/src/containers/forms/actions/Attribution";
import BoardSelect from "@erxes/ui-tickets/src/boards/containers/BoardSelect";
import { CollapseContent, Icon } from "@erxes/ui/src";
import {
  ControlLabel,
  FormControl,
  FormGroup,
} from "@erxes/ui/src/components/form";
import { FormColumn, FormWrapper, LinkButton } from "@erxes/ui/src/styles/main";
import { __ } from "@erxes/ui/src/utils";
import Select from "react-select";
import { DividerBox } from "../styles";
import { SelectCardType, SelectStage } from "./common";
import { ListItem, RemoveRow, Row } from "./styles";

const CardActionComponent = ({ action, initialProps, source, onChange }) => {
  const [params, setParams] = useState(initialProps || ({} as any));

  const handleChange = (value, name) => {
    const updatedParams = { ...params, [name]: value };
    onChange(updatedParams);
    setParams(updatedParams);
  };

  const renderMoveAction = (extraProps) => {
    const { pipelineId } = source;

    const updateProps = {
      ...extraProps,
      ...params,
      onChangeBoard: (e) => handleChange(e, "boardId"),
      onChangePipeline: (e) => handleChange(e, "pipelineId"),
      onChangeStage: (e) => handleChange(e, "stageId"),
    };

    console.log({ updateProps });

    return (
      <div>
        <BoardSelect {...updateProps} />
        <DividerBox>{__("ELSE")}</DividerBox>
        <SelectStage
        cardType={updateProps.type}
          name="declinedStageId"
          label={__("Declined Stage")}
          pipelineId={pipelineId || null}
          initialValue={(params?.logics || [])[0]?.targetStageId}
          onSelect={({ value }) =>
            handleChange(
              [{ logic: "declined", targetStageId: value }],
              "logics"
            )
          }
        />
      </div>
    );
  };

  const renderConfigs = (cardType:'deal'|'ticket'|'task') => {
    const { pipelineId } = source || {};

    const {
      configs,
    }: {
      configs: {
        _id: string;
        sourceStageId: string;
        destinationStageId: string;
      }[];
    } = params || {};

    const selectedSourceStageIds = configs.map(
      (config) => config.sourceStageId
    );
    const selectedDestinationStageIds = configs.map(
      (config) => config.destinationStageId
    );

    const removeConfig = (_id) => {
      const updatedConfigs = configs.filter((config) => config._id !== _id);
      onChange({ ...params, configs: updatedConfigs });
      setParams({ ...params, configs: updatedConfigs });
    };

    const onSelect = (value, name, configId) => {
      const updatedConfigs = configs.map((config) =>
        config._id === configId ? { ...config, [name]: value } : config
      );

      onChange({ ...params, configs: updatedConfigs });
      setParams({ ...params, configs: updatedConfigs });
    };

    return (configs || []).map((config) => (
      <ListItem key={config._id}>
        <RemoveRow onClick={() => removeConfig(config._id)}>
          <Icon icon="times-circle" />
        </RemoveRow>
        <FormWrapper>
          <FormColumn>
            <SelectStage
              cardType={cardType}
              name="sourceStageId"
              label={`${params.type} stage`}
              pipelineId={params.pipelineId}
              initialValue={config.sourceStageId}
              excludeIds={selectedSourceStageIds}
              onSelect={({ value }) =>
                onSelect(value, 'sourceStageId', config._id)
              }
            />
          </FormColumn>
          <FormColumn>
            <SelectStage
              cardType={cardType}
              name="destinationStageId"
              label={__("Destination stage")}
              pipelineId={pipelineId}
              excludeIds={selectedDestinationStageIds}
              initialValue={config.destinationStageId}
              onSelect={({ value }) =>
                onSelect(value, 'destinationStageId', config._id)
              }
            />
          </FormColumn>
        </FormWrapper>
      </ListItem>
    ));
  };

  const renderLogics = (cardType: 'deal' | 'ticket' | 'task') => {
    const { pipelineId } = source || {};

    const removeLogic = (_id) => {
      const updatedLogics = params.logics.filter((logic) => logic._id !== _id);
      onChange({ ...params, logics: updatedLogics });
      setParams({ ...params, logics: updatedLogics });
    };

    const onChangeLogic = (_id, value, name) => {
      const updatedLogics = params.logics.map((logic) =>
        logic._id === _id ? { ...logic, [name]: value } : logic
      );

      onChange({ ...params, logics: updatedLogics });
      setParams({ ...params, logics: updatedLogics });
    };

    const logicOptions = [
      { value: 'approved', label: 'Approved' },
      { value: 'declined', label: 'Declined' },
    ];

    const generateOptions = (_id, options) => {
      const logics = params.logics
        .filter((logic) => logic._id !== _id && logic?.logic)
        .map(({ logic }) => logic);

      options = options.filter((logic) => !logics.includes(logic.value));
      return options;
    };

    return params.logics.map((logic) => (
      <ListItem key={logic._id}>
        <RemoveRow onClick={() => removeLogic(logic._id)}>
          <Icon icon="times-circle" />
        </RemoveRow>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required>{__('Logic')}</ControlLabel>
              <Select
                value={generateOptions(logic._id, logicOptions).find(
                  (o) => o.value === logic.logic
                )}
                options={generateOptions(logic._id, logicOptions)}
                isClearable={true}
                onChange={({ value }) =>
                  onChangeLogic(logic._id, value, 'logic')
                }
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <SelectStage
              cardType={cardType}
              name="targetStageId"
              label={__("Stage")}
              pipelineId={pipelineId || null}
              initialValue={logic.targetStageId}
              onSelect={({ value }) =>
                onChangeLogic(logic._id, value, 'targetStageId')
              }
            />
          </FormColumn>
        </FormWrapper>
      </ListItem>
    ));
  };

  const renderCreateRelatedCard = ({ type }) => {
    const handleSelect = ({ value }) => {
      handleChange(value, "type");
    };

    const onNameChange = (e) => {
      const { value, name } = e.currentTarget as HTMLInputElement;
      handleChange(value, name);
    };

    const addConfig = () => {
      const updatedConfigs = params.configs || [];
      updatedConfigs.push({
        _id: Math.random(),
        sourceStageId: null,
        destinationStageId: null,
      });

      onChange({ ...params, configs: updatedConfigs });
      setParams({ ...params, configs: updatedConfigs });
    };

    const addLogics = () => {
      const updatedLogics = params.logics || [];
      updatedLogics.push({ _id: Math.random() });

      onChange({ ...params, logics: updatedLogics });
    };

    const updateProps = {
      ...params,
      onChangeBoard: (e) => handleChange(e, "boardId"),
      onChangePipeline: (e) => handleChange(e, "pipelineId"),
      onChangeStage: (e) => handleChange(e, "stageId"),
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required>{__('Card Type')}</ControlLabel>
          <SelectCardType
            type={type}
            handleSelect={handleSelect}
            params={params}
          />
        </FormGroup>
        {params['type'] !== type && (
          <>
            <CollapseContent title={__("Settings")} compact>
              <BoardSelect {...updateProps} />
              <FormGroup>
                <Row>
                  <ControlLabel required>{__('Name')}</ControlLabel>
                  <Attribution
                    triggerType={`cards:${params['type']}`}
                    inputName="name"
                    config={params}
                    setConfig={(updatedParams) => onChange(updatedParams)}
                  />
                </Row>
                <FormControl
                  name="name"
                  value={params?.name}
                  onChange={onNameChange}
                />
              </FormGroup>
            </CollapseContent>
            <Row>
              <FormGroup>
                <ControlLabel>
                  {__(`Track changes ${params?.type || ''}`)}
                </ControlLabel>
                <FormControl
                  checked={!!params?.configs}
                  componentclass="checkbox"
                  onClick={() =>
                    handleChange(!params?.configs ? [] : null, 'configs')
                  }
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__(`Logic`)}</ControlLabel>
                <FormControl
                  checked={!!params?.logics}
                  componentclass="checkbox"
                  onClick={() =>
                    handleChange(!params?.logics ? [] : null, 'logics')
                  }
                />
              </FormGroup>
            </Row>

            {!!params?.configs && (
              <CollapseContent title={__("Track Changes Configurations")} compact>
                {renderConfigs(type)}
                <LinkButton onClick={addConfig}>
                  <Icon icon="plus-1" /> {__('Add config')}
                </LinkButton>
              </CollapseContent>
            )}
            {!!params?.logics && (
              <CollapseContent title={__("After logics")} compact>
                {renderLogics(type)}
                <LinkButton onClick={addLogics}>
                  <Icon icon="plus-1" /> {__('Add logic')}
                </LinkButton>
              </CollapseContent>
            )}
          </>
        )}
      </>
    );
  };

  const renderComponent = () => {
    if (!action) {
      return null;
    }

    if (action === "changeStage") {
      return renderMoveAction({ ...source });
    }

    if (action === "createRelatedCard") {
      return renderCreateRelatedCard({ ...source });
    }

    return null;
  };

  return renderComponent();
};

export default CardActionComponent;
