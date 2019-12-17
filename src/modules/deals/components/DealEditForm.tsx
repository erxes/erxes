import EditForm from 'modules/boards/components/editForm/EditForm';
import Left from 'modules/boards/components/editForm/Left';
import Sidebar from 'modules/boards/components/editForm/Sidebar';
import Top from 'modules/boards/components/editForm/Top';
import { FlexContent } from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';

import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';
import { IDeal, IDealParams } from '../types';

type Props = {
  options: IOptions;
  item: IDeal;
  addItem: (doc: IDealParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IDealParams, callback?: (item) => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
};

export default class DealEditForm extends React.Component<Props> {
  renderItems = () => {
    return (
      <>
        <PortableTickets mainType="deal" mainTypeId={this.props.item._id} />
        <PortableTasks mainType="deal" mainTypeId={this.props.item._id} />
      </>
    );
  };

  renderFormContent = ({
    saveItem,
    onChangeStage,
    copy,
    remove,
    renderAmount,
    renderSidebar
  }: IEditFormContent) => {
    const { item, options, onUpdate } = this.props;

    return (
      <>
        <Top
          options={options}
          stageId={item.stageId}
          item={item}
          saveItem={saveItem}
          onChangeStage={onChangeStage}
          amount={renderAmount}
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
            sidebar={renderSidebar}
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
      formContent: this.renderFormContent
    };

    return <EditForm {...extendedProps} />;
  }
}
