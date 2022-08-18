import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { Alert, __ } from '@erxes/ui/src/utils';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import Select from 'react-select-plus';
import React from 'react';
import { IConfigsMap } from '../../../../../plugin-ebarimt-ui/src/types';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (name: 'cardsConfig', value: any) => void;
  delete: (currentConfigKey: string) => void;
};

type State = {
  config: any;
  hasOpen: boolean;
};

class PerConfigs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
      hasOpen: false
    };
  }

  onChangeBranch = branchId => {
    this.setState({ config: { ...this.state.config, branchId } });
  };

  onChangeAsssignedUserIds = assignedUserIds => {
    this.setState({ config: { ...this.state.config, assignedUserIds } });
  };

  onChangeBoard = (boardId: string) => {
    this.setState({ config: { ...this.state.config, boardId } });
  };

  onChangePipeline = (pipelineId: string) => {
    this.setState({ config: { ...this.state.config, pipelineId } });
  };

  onChangeStage = (stageId: string) => {
    this.setState({ config: { ...this.state.config, stageId } });
  };

  onSave = e => {
    e.preventDefault();
    const { configsMap, currentConfigKey } = this.props;
    const { config } = this.state;
    const key = Math.floor(Math.random() * 1000000 + 1);

    delete configsMap.cardsConfig[currentConfigKey];
    configsMap.cardsConfig[key] = config;
    this.props.save('cardsConfig', configsMap);
    Alert.success('You successfully updated stage in cards settings.');
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

  render() {
    const { config } = this.state;
    return (
      <CollapseContent
        title={__(config.title)}
        open={this.props.currentConfigKey === 'newCardsConfig' ? true : false}
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

        <FormGroup>
          <ControlLabel>Choose Branch</ControlLabel>
          <SelectBranches
            label={__('Choose branch')}
            name="branchIds"
            multi={false}
            initialValue={config.branchId}
            onSelect={this.onChangeBranch}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose Stage</ControlLabel>
          <BoardSelectContainer
            type="deal"
            autoSelectStage={false}
            boardId={config.boardId}
            pipelineId={config.pipelineId}
            stageId={config.stageId}
            onChangeBoard={this.onChangeBoard}
            onChangePipeline={this.onChangePipeline}
            onChangeStage={this.onChangeStage}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose assigned users</ControlLabel>
          <SelectTeamMembers
            label={__('Choose team member')}
            name="assignedUserIds"
            initialValue={config.assignedUserIds}
            onSelect={this.onChangeAsssignedUserIds}
          />
        </FormGroup>

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
            disabled={config.stageId ? false : true}
          >
            Save
          </Button>
        </ModalFooter>
      </CollapseContent>
    );
  }
}
export default PerConfigs;
