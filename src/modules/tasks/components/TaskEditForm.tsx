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
import { __ } from 'modules/common/utils';
import PortableDeals from 'modules/deals/components/PortableDeals';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';
import Select from 'react-select-plus';
import { ITask, ITaskParams } from '../types';

type Props = {
  options: IOptions;
  item: ITask;
  addItem: (doc: ITaskParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: ITaskParams, callback?: (item) => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  onUpdate: (item: ITask, prevStageId?: string) => void;
  beforePopupClose: () => void;
};

type State = {
  priority: string;
};

export default class TaskEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      priority: props.item.priority || ''
    };
  }

  renderSidebarFields = saveItem => {
    const priorityValues = PRIORITIES.map(p => ({ label: __(p), value: p }));

    const priorityValueRenderer = (
      option: ISelectedOption
    ): React.ReactNode => (
      <>
        <PriorityIndicator value={option.value} /> {option.label}
      </>
    );

    const onPriorityChange = (option: ISelectedOption) => {
      const value = option ? option.value : '';

      this.setState({ priority: value });

      if (saveItem) {
        saveItem({ priority: value });
      }
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Priority</ControlLabel>
          <Select
            placeholder={__('Select a priority')}
            value={this.state.priority}
            options={priorityValues}
            onChange={onPriorityChange}
            optionRenderer={priorityValueRenderer}
            valueRenderer={priorityValueRenderer}
          />
        </FormGroup>
      </>
    );
  };

  renderItems = () => {
    return (
      <>
        <PortableDeals mainType="task" mainTypeId={this.props.item._id} />
        <PortableTickets mainType="task" mainTypeId={this.props.item._id} />
      </>
    );
  };

  renderFormContent = ({
    state,
    copy,
    remove,
    saveItem,
    onChangeStage
  }: IEditFormContent) => {
    const { item, options } = this.props;

    const renderSidebar = () => this.renderSidebarFields(saveItem);

    return (
      <>
        <Top
          options={options}
          stageId={state.stageId}
          item={item}
          saveItem={saveItem}
          onChangeStage={onChangeStage}
        />

        <FlexContent>
          <Left type={options.type} item={item} saveItem={saveItem} />

          <Sidebar
            options={options}
            item={item}
            sidebar={renderSidebar}
            saveItem={saveItem}
            copyItem={copy}
            removeItem={remove}
            renderItems={this.renderItems}
          />
        </FlexContent>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      formContent: this.renderFormContent,
      extraFields: this.state
    };

    return <EditForm {...extendedProps} />;
  }
}
