import EditForm from 'modules/boards/components/editForm/EditForm';
import Left from 'modules/boards/components/editForm/Left';
import Sidebar from 'modules/boards/components/editForm/Sidebar';
import Top from 'modules/boards/components/editForm/Top';
import { FlexContent } from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import { __ } from 'modules/common/utils';
import PortableDeals from 'modules/deals/components/PortableDeals';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';
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
    const { item, options, onUpdate } = this.props;

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
          <Left
            options={options}
            saveItem={saveItem}
            copyItem={copy}
            removeItem={remove}
            onUpdate={onUpdate}
            item={item}
          />

          <Sidebar
            options={options}
            item={item}
            saveItem={saveItem}
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
