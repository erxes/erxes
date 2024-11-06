import { IBoard, IPipeline, IStage } from "../types";

import ControlLabel from "@erxes/ui/src/components/form/Label";
import { FormContainer } from "../styles/common";
import Select, { components } from "react-select";
import FormGroup from "@erxes/ui/src/components/form/Group";
import React from "react";
import { selectOptions } from "../utils";

type Props = {
  boards: IBoard[];
  pipelines: IPipeline[];
  stages: IStage[];
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  onChangeBoard: (value: string) => void;
  onChangePipeline: (value: string) => void;
  onChangeStage: (value: string, callback?: () => void) => void;
  callback?: () => void;
  translator?: (key: string, options?: any) => string;
  isRequired?: boolean;
  isOptional?: boolean;
};

class BoardSelect extends React.Component<Props> {
  renderOptions = (option) => {
    return (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );
  };

  renderSelect(placeholder, value, onChange, options) {
    const Option = (props) => {
      return (
        <components.Option {...props}>
          {this.renderOptions(props.data)}
        </components.Option>
      );
    };

    return (
      <Select
        required={!this.props.isRequired ? this.props.isRequired : true}
        placeholder={placeholder}
        value={options.find((o) => value === o.value)}
        onChange={onChange}
        components={{ Option }}
        options={options}
        isClearable={false}
      />
    );
  }

  renderContent() {
    const {
      boards,
      pipelines,
      stages,
      boardId,
      pipelineId,
      stageId,
      onChangeBoard,
      onChangePipeline,
      onChangeStage,
      callback,
      isOptional
    } = this.props;

    const __ = (key: string, options?: any) => {
      const { translator } = this.props;
      if (!translator) {
        return key;
      }
      return translator(key, options);
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Board {isOptional && "(optional)"}</ControlLabel>
          {this.renderSelect(
            __("Choose a board"),
            boardId,
            (board) => onChangeBoard(board.value),
            selectOptions(boards)
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Pipeline {isOptional && "(optional)"}</ControlLabel>
          {this.renderSelect(
            __("Choose a pipeline"),
            pipelineId,
            (pipeline) => onChangePipeline(pipeline.value),
            selectOptions(pipelines)
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Stage {isOptional && "(optional)"}</ControlLabel>
          {this.renderSelect(
            __("Choose a stage"),
            stageId,
            (stage) => onChangeStage(stage.value, callback),
            selectOptions(stages)
          )}
        </FormGroup>
      </>
    );
  }

  render() {
    return <>{this.renderContent()}</>;
  }
}

export default BoardSelect;
