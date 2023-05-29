import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import client from '@erxes/ui/src/apolloClient';
import gql from 'graphql-tag';
import React from 'react';
import Select from 'react-select-plus';
import { __ } from '@erxes/ui/src/utils';
import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IConfigsMap } from '../types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';

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
  fieldsCombined: FieldsCombinedByType[];
};

class PerSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
      hasOpen: false,
      fieldsCombined: []
    };

    if (isEnabled('forms')) {
      client
        .query({
          query: gql(formQueries.fieldsCombinedByContentType),
          variables: {
            contentType: 'cards:deal'
          }
        })
        .then(({ data }) => {
          this.setState({
            fieldsCombined: data ? data.fieldsCombinedByContentType : [] || []
          });
        });
    }
  }

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
    const key = config.stageId;

    delete configsMap.stageInMoveConfig[currentConfigKey];
    configsMap.stageInMoveConfig[key] = config;
    this.props.save(configsMap);
  };

  onDelete = e => {
    e.preventDefault();

    this.props.delete(this.props.currentConfigKey);
  };

  onChangeCombo = option => {
    this.onChangeConfig('defaultPay', option.value);
  };

  onChangeCheckbox = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  };

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    config[code] = value;
    this.setState({ config });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onresponseCustomFieldChange = option => {
    const value = !option ? '' : option.value.toString();
    this.onChangeConfig('responseField', value);
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

  renderCheckbox = (key: string, title?: string, description?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={config[key]}
          onChange={this.onChangeCheckbox.bind(this, key)}
          componentClass="checkbox"
        />
      </FormGroup>
    );
  };

  addCals = () => {
    const { config } = this.state;
    const { catAccLocMap = [] } = config;

    catAccLocMap.push({
      _id: Math.random().toString(),
      category: '',
      branch: '',
      department: '',
      account: '',
      location: '',
      moveAccount: '',
      moveLocation: ''
    });

    this.setState({ config: { ...config, catAccLocMap } });
  };

  renderCalsMap() {
    const { config } = this.state;
    const { catAccLocMap } = config;

    const cals: React.ReactNode[] = [];
    cals.push(
      <FormWrapper key={Math.random()}>
        <FormColumn>
          <ControlLabel>Product Category</ControlLabel>
        </FormColumn>
        <FormColumn>
          <ControlLabel>Branch</ControlLabel>
        </FormColumn>
        <FormColumn>
          <ControlLabel>Department</ControlLabel>
        </FormColumn>
        <FormColumn>
          <ControlLabel>Main Account</ControlLabel>
        </FormColumn>
        <FormColumn>
          <ControlLabel>Main Location</ControlLabel>
        </FormColumn>
        <FormColumn>
          <ControlLabel>Move Account</ControlLabel>
        </FormColumn>
        <FormColumn>
          <ControlLabel>Move Location</ControlLabel>
        </FormColumn>
        <FormColumn>
          <Button btnStyle="link" icon="plus-circle" onClick={this.addCals}>
            Add
          </Button>
        </FormColumn>
      </FormWrapper>
    );

    const editMapping = (id, e) => {
      const index = catAccLocMap.findIndex(i => i._id === id);

      const name = e.target.name;
      const value = e.target.value;

      const item = {
        ...(catAccLocMap.find(cal => cal._id === id) || {}),
        [name]: value
      };

      if (index !== -1) {
        catAccLocMap[index] = item;
      } else {
        catAccLocMap.push(item);
      }

      this.setState({ config: { ...config, catAccLocMap } });
    };

    const removeMapping = (_id: string) => {
      const excluded = catAccLocMap.filter(m => m._id !== _id);

      this.setState({ config: { ...config, catAccLocMap: excluded } });
    };

    for (const map of catAccLocMap || []) {
      cals.push(
        <FormWrapper key={map._id}>
          <FormColumn>
            <FormControl
              defaultValue={map.category}
              name="category"
              onChange={editMapping.bind(this, map._id)}
              required={true}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <FormControl
              defaultValue={map.branch}
              name="branch"
              onChange={editMapping.bind(this, map._id)}
              required={false}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <FormControl
              defaultValue={map.department}
              name="department"
              onChange={editMapping.bind(this, map._id)}
              required={false}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <FormControl
              defaultValue={map.account}
              name="account"
              onChange={editMapping.bind(this, map._id)}
              required={true}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <FormControl
              defaultValue={map.location}
              name="location"
              onChange={editMapping.bind(this, map._id)}
              required={true}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <FormControl
              defaultValue={map.moveAccount}
              name="moveAccount"
              onChange={editMapping.bind(this, map._id)}
              required={true}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <FormControl
              defaultValue={map.moveLocation}
              name="moveLocation"
              onChange={editMapping.bind(this, map._id)}
              required={true}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <Button
              btnStyle="link"
              icon="trash"
              onClick={() => removeMapping(map._id)}
            />
          </FormColumn>
        </FormWrapper>
      );
    }
    return cals;
  }

  render() {
    const { config } = this.state;
    return (
      <CollapseContent
        title={__(config.title)}
        open={this.props.currentConfigKey === 'newMoveConfig' ? true : false}
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
                stageId={config.stageId}
                onChangeBoard={this.onChangeBoard}
                onChangePipeline={this.onChangePipeline}
                onChangeStage={this.onChangeStage}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            {this.renderInput('userEmail', 'User Email', '')}
            {this.renderInput('defaultCustomer', 'Default Customer', '')}

            <FormGroup>
              <ControlLabel>{__('Choose response field')}</ControlLabel>
              <Select
                name="responseField"
                value={config.responseField}
                onChange={this.onresponseCustomFieldChange}
                options={(this.state.fieldsCombined || []).map(f => ({
                  value: f.name,
                  label: f.label
                }))}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        {this.renderCalsMap()}

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
export default PerSettings;
