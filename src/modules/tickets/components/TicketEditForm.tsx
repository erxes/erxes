import { IUser } from 'modules/auth/types';
import {
  EditForm,
  PriorityIndicator
} from 'modules/boards/components/editForm';
import { PRIORITIES } from 'modules/boards/constants';
import { IOptions } from 'modules/boards/types';
import { ControlLabel, FormGroup } from 'modules/common/components';
import { ISelectedOption } from 'modules/common/types';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import { Capitalize } from 'modules/settings/permissions/styles';
import React from 'react';
import Select from 'react-select-plus';
import { ITicket, ITicketParams } from '../types';

type Props = {
  options: IOptions;
  item: ITicket;
  users: IUser[];
  addItem: (doc: ITicketParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: ITicketParams, callback: () => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  closeModal: () => void;
};

type State = {
  priority: string;
  source: string;
};

export default class TicketEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      priority: item.priority || '',
      source: item.source || ''
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  renderSidebarFields = () => {
    const { priority, source } = this.state;

    const priorityValues = PRIORITIES.map(p => ({ label: p, value: p }));
    const sourceValues = KIND_CHOICES.ALL_LIST.map(key => ({
      label: key,
      value: key
    }));
    sourceValues.push({
      label: 'other',
      value: 'other'
    });

    const onChangePriority = (option: ISelectedOption) =>
      this.onChangeField('priority', option ? option.value : '');
    const onChangeSource = (option: ISelectedOption) =>
      this.onChangeField('source', option ? option.value : '');

    const priorityValueRenderer = (
      option: ISelectedOption
    ): React.ReactNode => (
      <>
        <PriorityIndicator value={option.value} /> {option.label}
      </>
    );

    const sourceValueRenderer = (option: ISelectedOption): React.ReactNode => (
      <Capitalize>{option.label}</Capitalize>
    );

    return (
      <>
        <FormGroup>
          <ControlLabel>Priority</ControlLabel>
          <Select
            placeholder="Select a priority"
            value={priority}
            options={priorityValues}
            onChange={onChangePriority}
            optionRenderer={priorityValueRenderer}
            valueRenderer={priorityValueRenderer}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Source</ControlLabel>
          <Select
            placeholder="Select a source"
            value={source}
            options={sourceValues}
            onChange={onChangeSource}
            optionRenderer={sourceValueRenderer}
            valueRenderer={sourceValueRenderer}
          />
        </FormGroup>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      sidebar: this.renderSidebarFields,
      extraFields: this.state
    };

    return <EditForm {...extendedProps} />;
  }
}
