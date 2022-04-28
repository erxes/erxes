import React from 'react';
import Select from 'react-select-plus';

import Button from 'modules/common/components/Button';
import { ModalFooter } from 'modules/common/styles/main';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __, Alert } from 'modules/common/utils';
import { IApp, IAppAddEditParams } from '../types';

type Props = {
  userGroups: any[];
  app?: IApp;
  closeModal: () => void;
  addApp: (doc: IAppAddEditParams) => void;
  editApp: (_id: string, doc: IAppAddEditParams) => void;
}

type State = {
  userGroupId: string;
  name: string;
}

export default class AppForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { app = { userGroupId: '', name: '' } } = props;

    this.state = {
      userGroupId: app.userGroupId,
      name: app.name
    }
  }

  render() {
    const { app, userGroups = [], closeModal, addApp, editApp } = this.props;
    const { userGroupId } = this.state;

    const onGroupChange = (option) => {
      const value = option ? option.value : '';

      this.setState({ userGroupId: value });
    }

    const options = userGroups.map(g => ({ value: g._id, label: g.name }));

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const el = document.getElementById('app-name') as HTMLInputElement;

      if (!(el && el.value)) {
        return Alert.warning(__('App name must not be empty'));
      }
      if (!userGroupId) {
        return Alert.warning(__('User group must be chosen'));
      }

      const doc = { name: el.value, userGroupId }

      if (app) {
        editApp(app._id, doc);
      }

      addApp(doc);

      return closeModal();
    }

    return (
      <form onSubmit={onSubmit}>
        <FormGroup>
          <ControlLabel required={true}>{__('Name')}</ControlLabel>
          <FormControl defaultValue={app && app.name} id='app-name' />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__('User group')}</ControlLabel>
          <Select
            placeholder={__('Choose user group')}
            options={options}
            value={this.state.userGroupId}
            onChange={opt => onGroupChange(opt)}
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            {__('Cancel')}
          </Button>
          <Button
            btnStyle="success"
            type="submit"
            icon="checked-1"
          >
            {__(app ? 'Edit' : 'Add')}
          </Button>
        </ModalFooter>
      </form>
    );
  }
}