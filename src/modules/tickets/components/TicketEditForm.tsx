import { IUser } from 'modules/auth/types';
import EditForm from 'modules/boards/components/editForm/EditForm';
import Left from 'modules/boards/components/editForm/Left';
import PriorityIndicator from 'modules/boards/components/editForm/PriorityIndicator';
import Sidebar from 'modules/boards/components/editForm/Sidebar';
import Top from 'modules/boards/components/editForm/Top';
import { PRIORITIES } from 'modules/boards/constants';
import { FlexContent } from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
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
  saveItem: (doc: ITicketParams, callback?: (item) => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
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

    const onChangePriority = (option: ISelectedOption) => {
      this.props.saveItem({ priority: option ? option.value : '' }, () =>
        this.onChangeField('priority', option ? option.value : '')
      );
    };
    const onChangeSource = (option: ISelectedOption) => {
      this.props.saveItem({ source: option ? option.value : '' }, () =>
        this.onChangeField('source', option ? option.value : '')
      );
    };

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

  renderFormContent = ({
    state,
    onChangeAttachment,
    onChangeField,
    copy,
    remove,
    onBlurFields
  }: IEditFormContent) => {
    const { item, users, options } = this.props;

    const {
      name,
      stageId,
      description,
      closeDate,
      assignedUserIds,
      customers,
      companies,
      attachments
    } = state;

    return (
      <>
        <Top
          options={options}
          name={name}
          closeDate={closeDate}
          users={users}
          onBlurFields={onBlurFields}
          stageId={stageId}
          item={item}
          onChangeField={onChangeField}
        />

        <FlexContent>
          <Left
            onChangeAttachment={onChangeAttachment}
            type={options.type}
            description={description}
            onBlurFields={onBlurFields}
            attachments={attachments}
            item={item}
            onChangeField={onChangeField}
          />

          <Sidebar
            options={options}
            customers={customers}
            companies={companies}
            assignedUserIds={assignedUserIds}
            item={item}
            sidebar={this.renderSidebarFields}
            onChangeField={onChangeField}
            copyItem={copy}
            removeItem={remove}
          />
        </FlexContent>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      formContent: this.renderFormContent,
      sidebar: this.renderSidebarFields,
      extraFields: this.state
    };

    return <EditForm {...extendedProps} />;
  }
}
