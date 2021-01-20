import EditForm from 'modules/boards/components/editForm/EditForm';
import Left from 'modules/boards/components/editForm/Left';
import Sidebar from 'modules/boards/components/editForm/Sidebar';
import Top from 'modules/boards/components/editForm/Top';
import { FlexContent } from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ISelectedOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import PortableDeals from 'modules/deals/components/PortableDeals';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import { Capitalize } from 'modules/settings/permissions/styles';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import React, { useEffect, useState } from 'react';
import Select from 'react-select-plus';
import { ITicket, ITicketParams } from '../types';

type Props = {
  options: IOptions;
  item: ITicket;
  addItem: (doc: ITicketParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: ITicketParams, callback?: (item) => void) => void;
  copyItem: (itemId: string, callback: (item) => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
  sendToBoard?: (item: any) => void;
};

export default function TicketEditForm(props: Props) {
  const item = props.item;

  const [source, setSource] = useState(item.source);

  useEffect(() => {
    setSource(item.source);
  }, [item.source]);

  function renderSidebarFields(saveItem) {
    const sourceValues = INTEGRATION_KINDS.ALL.map(kind => ({
      label: __(kind.text),
      value: kind.value
    }));

    sourceValues.push({
      label: __('Other'),
      value: 'other'
    });

    const sourceValueRenderer = (option: ISelectedOption): React.ReactNode => (
      <Capitalize>{option.label}</Capitalize>
    );

    const onSourceChange = option => {
      const value = option ? option.value : '';

      setSource(value);

      if (saveItem) {
        saveItem({ source: value });
      }
    };

    return (
      <FormGroup>
        <ControlLabel>Source</ControlLabel>
        <Select
          placeholder={__('Select a source')}
          value={source}
          options={sourceValues}
          onChange={onSourceChange}
          optionRenderer={sourceValueRenderer}
          valueRenderer={sourceValueRenderer}
        />
      </FormGroup>
    );
  }

  function renderItems() {
    return (
      <>
        <PortableDeals mainType="ticket" mainTypeId={props.item._id} />
        <PortableTasks mainType="ticket" mainTypeId={props.item._id} />
      </>
    );
  }

  function renderFormContent({
    state,
    copy,
    remove,
    saveItem,
    onChangeStage
  }: IEditFormContent) {
    const { options, onUpdate, addItem, sendToBoard } = props;

    const renderSidebar = () => renderSidebarFields(saveItem);

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
            addItem={addItem}
            sendToBoard={sendToBoard}
            onChangeStage={onChangeStage}
          />

          <Sidebar
            options={options}
            item={item}
            sidebar={renderSidebar}
            saveItem={saveItem}
            renderItems={renderItems}
          />
        </FlexContent>
      </>
    );
  }

  const extendedProps = {
    ...props,
    formContent: renderFormContent,
    extraFields: { source }
  };

  return <EditForm {...extendedProps} />;
}
