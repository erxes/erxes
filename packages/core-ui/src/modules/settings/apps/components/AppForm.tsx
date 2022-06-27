import React from 'react';
import Select from 'react-select-plus';
import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';

import Button from 'modules/common/components/Button';
import { ModalFooter } from 'modules/common/styles/main';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __, Alert } from 'modules/common/utils';
import { IApp, IAppParams } from '../types';

type Props = {
  userGroups: any[];
  app?: IApp;
  closeModal: () => void;
  addApp: (doc: IAppParams) => void;
  editApp: (_id: string, doc: IAppParams) => void;
};

type State = {
  userGroupId: string;
  name: string;
  expireDate?: Date;
};

export default class AppForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const {
      app = {
        userGroupId: '',
        name: '',
        expireDate: dayjs()
          .add(30, 'day')
          .toDate()
      }
    } = props;

    this.state = {
      userGroupId: app.userGroupId,
      name: app.name,
      expireDate: app.expireDate
    };
  }

  render() {
    const { app, userGroups = [], closeModal, addApp, editApp } = this.props;
    const { userGroupId, expireDate } = this.state;

    const onGroupChange = option => {
      const value = option ? option.value : '';

      this.setState({ userGroupId: value });
    };

    const onDateChange = val => {
      this.setState({ expireDate: val });
    };

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

      const doc = { name: el.value, userGroupId, expireDate };

      if (app) {
        editApp(app._id, doc);
      }

      addApp(doc);

      return closeModal();
    };

    return (
      <form onSubmit={onSubmit}>
        <FormGroup>
          <ControlLabel required={true}>{__('Name')}</ControlLabel>
          <FormControl defaultValue={app && app.name} id="app-name" />
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
        <FormGroup>
          <ControlLabel>{__('Expire date')}</ControlLabel>
          <Datetime
            inputProps={{ placeholder: __('Click to select a date') }}
            dateFormat="YYYY/MM/DD"
            timeFormat={false}
            value={expireDate}
            closeOnSelect={true}
            utc={true}
            input={false}
            onChange={onDateChange}
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
          <Button btnStyle="success" type="submit" icon="checked-1">
            {__(app ? 'Edit' : 'Add')}
          </Button>
        </ModalFooter>
      </form>
    );
  } // end render()
}
