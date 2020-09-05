import Button from 'modules/common/components/Button';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { __, Alert } from 'modules/common/utils';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import Select from 'react-select-plus';
import { mutations } from '../graphql';
import { Divider, StepBody, StepHeader, StepItem } from '../styles';
import { IActions, IModule, IUserGroup } from '../types';
import {
  correctValue,
  filterActions,
  generatedList,
  generateListParams,
  generateModuleParams
} from './utils';

type Props = {
  modules: IModule[];
  actions: IActions[];
  groups: IUserGroup[];
  refetchQueries: any;
  closeModal: () => void;
};

type State = {
  selectedModule: string;
  selectedActions: IActions[];
  selectedUserIds: string[];
  selectedGroups: IUserGroup[];
  valueChanged: boolean;
  isSubmitted: boolean;
};

class PermissionForm extends React.Component<Props, State> {
  state = {
    selectedModule: '',
    selectedActions: [],
    selectedUserIds: [],
    selectedGroups: [],
    valueChanged: false,
    isSubmitted: false
  };

  save = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      selectedModule,
      selectedActions,
      selectedUserIds,
      selectedGroups
    } = this.state;

    if (!selectedModule) {
      return Alert.error('Please select the module!');
    }

    if (!this.hasItems(selectedActions)) {
      return Alert.error('Please select at least one action!');
    }

    if (!this.hasItems(selectedGroups) && !this.hasItems(selectedUserIds)) {
      return Alert.error('Please select at least one group or user!');
    }

    return this.setState({ isSubmitted: true });
  };

  getVariables = () => {
    const {
      selectedModule,
      selectedActions,
      selectedUserIds,
      selectedGroups,
      valueChanged
    } = this.state;

    return {
      module: selectedModule,
      actions: this.collectValues(selectedActions),
      userIds: selectedUserIds,
      groupIds: this.collectValues(selectedGroups),
      allowed: valueChanged
    };
  };

  onChange = () => {
    this.setState({ valueChanged: true });
  };

  hasItems = (items: string[]) => {
    return items.length > 0 ? true : false;
  };

  isModuleSelected = () => {
    if (this.state.selectedModule) {
      return true;
    }

    return false;
  };

  select = <T extends keyof State>(name: T, value) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  changeModule = (item: generatedList) => {
    const selectedModule = correctValue(item);

    this.setState({
      selectedModule,
      selectedActions: []
    });
  };

  collectValues = (items: generatedList[]) => {
    return items.map(item => item.value);
  };

  renderContent() {
    const { modules, actions, groups } = this.props;
    const {
      selectedModule,
      selectedActions,
      selectedUserIds,
      selectedGroups,
      valueChanged
    } = this.state;

    const usersOnChange = users => this.select('selectedUserIds', users);

    return (
      <>
        <StepItem>
          <StepHeader
            number="1"
            isDone={this.isModuleSelected() && this.hasItems(selectedActions)}
          >
            {__('What action can do')}
          </StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel required={true}>Choose the module</ControlLabel>
              <Select
                placeholder={__('Choose module')}
                options={generateModuleParams(modules)}
                value={selectedModule}
                onChange={this.changeModule}
              />
            </FormGroup>
            <Divider>{__('Then')}</Divider>
            <FormGroup>
              <ControlLabel required={true}>Choose the actions</ControlLabel>
              <Select
                placeholder={__('Choose actions')}
                options={filterActions(actions, selectedModule)}
                value={selectedActions}
                disabled={!this.isModuleSelected()}
                onChange={this.select.bind(this, 'selectedActions')}
                multi={true}
              />
            </FormGroup>
          </StepBody>
        </StepItem>

        <StepItem>
          <StepHeader
            number="2"
            isDone={
              this.hasItems(selectedGroups) || this.hasItems(selectedUserIds)
            }
          >
            {__('Who can')}
          </StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel required={true}>Choose the groups</ControlLabel>
              <Select
                placeholder={__('Choose groups')}
                options={generateListParams(groups)}
                value={selectedGroups}
                onChange={this.select.bind(this, 'selectedGroups')}
                multi={true}
              />
            </FormGroup>
            <Divider>{__('Or')}</Divider>
            <FormGroup>
              <ControlLabel required={true}>Choose the users</ControlLabel>

              <SelectTeamMembers
                label="Choose users"
                name="selectedUserIds"
                value={selectedUserIds}
                onSelect={usersOnChange}
              />
            </FormGroup>
          </StepBody>
        </StepItem>

        <StepItem>
          <StepHeader number="3" isDone={valueChanged}>
            {__('Grant permission')}
          </StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel>Allow</ControlLabel>

              <FormControl
                componentClass="checkbox"
                defaultChecked={false}
                id="allowed"
                onChange={this.onChange}
              />
              <p>{__('Check if permission is allowed')}</p>
            </FormGroup>
          </StepBody>
        </StepItem>
      </>
    );
  }

  render() {
    const { closeModal, refetchQueries } = this.props;

    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <ButtonMutate
            mutation={mutations.permissionAdd}
            variables={this.getVariables()}
            callback={closeModal}
            refetchQueries={refetchQueries}
            isSubmitted={this.state.isSubmitted}
            type="submit"
            successMessage={__(`You successfully added a permission`) + '.'}
          />
        </ModalFooter>
      </form>
    );
  }
}

export default PermissionForm;
