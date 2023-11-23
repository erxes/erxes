import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import { __ } from '@erxes/ui/src/utils';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import React from 'react';
import { IConfigsMap } from '../types';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

type State = {
  config: any;
  hasOpen: boolean;
};

class PerSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
      hasOpen: false
    };
  }

  onChangeBoard = (boardId: string) => {
    this.setState({ config: { ...this.state.config, boardId } });
  };

  onChangePipeline = (pipelineId: string) => {
    this.setState({ config: { ...this.state.config, pipelineId } });
  };

  onSave = e => {
    e.preventDefault();
    const { configsMap, currentConfigKey } = this.props;
    const { config } = this.state;
    const key = config.pipelineId;

    delete configsMap.remainderConfig[currentConfigKey];
    configsMap.remainderConfig[key] = config;
    this.props.save(configsMap);
  };

  onDelete = e => {
    e.preventDefault();

    this.props.delete(this.props.currentConfigKey);
  };

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    config[code] = value;
    this.setState({ config });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  renderInput = (key: string, title?: string, description?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={config[key]}
          onChange={this.onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  render() {
    const { config } = this.state;
    return (
      <CollapseContent
        title={__(config.title)}
        open={
          this.props.currentConfigKey === 'newremainderConfig' ? true : false
        }
      >
        <FormGroup>
          <ControlLabel>{'Title'}</ControlLabel>
          <FormControl
            defaultValue={config['title']}
            onChange={this.onChangeInput.bind(this, 'title')}
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <BoardSelectContainer
                type="deal"
                autoSelectStage={false}
                boardId={config.boardId}
                pipelineId={config.pipelineId}
                onChangeBoard={this.onChangeBoard}
                onChangePipeline={this.onChangePipeline}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            {this.renderInput('account', 'account', '')}
            {this.renderInput('location', 'location', '')}
          </FormColumn>
        </FormWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={this.onDelete}
            uppercase={false}
          >
            Delete
          </Button>

          <Button
            btnStyle="primary"
            icon="check-circle"
            onClick={this.onSave}
            uppercase={false}
            disabled={config.pipelineId ? false : true}
          >
            Save
          </Button>
        </ModalFooter>
      </CollapseContent>
    );
  }
}
export default PerSettings;
