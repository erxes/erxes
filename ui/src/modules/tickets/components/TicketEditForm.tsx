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
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import { Capitalize } from 'modules/settings/permissions/styles';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import React from 'react';
import Select from 'react-select-plus';
import { ITicket, ITicketParams } from '../types';

type Props = {
  options: IOptions;
  item: ITicket;
  addItem: (doc: ITicketParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: ITicketParams, callback?: (item) => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
};

type State = {
  source: string;
};

export default class TicketEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      source: item.source || ''
    };
  }

  renderSidebarFields = saveItem => {
    const { source } = this.state;

    const sourceValues = KIND_CHOICES.ALL_LIST.map(key => ({
      label: __(key),
      value: key
    }));

    sourceValues.push({
      label: __('other'),
      value: 'other'
    });

    const onSelectChange = <T extends keyof State>(
      option: ISelectedOption,
      name: T
    ) => {
      const value = option ? option.value : '';

      this.setState({ [name]: value } as Pick<State, keyof State>, () => {
        if (saveItem) {
          saveItem({ [name]: value });
        }
      });
    };

    const sourceValueRenderer = (option: ISelectedOption): React.ReactNode => (
      <Capitalize>{option.label}</Capitalize>
    );

    const onSourceChange = option => onSelectChange(option, 'source');

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
  };

  renderItems = () => {
    return (
      <>
        <PortableDeals mainType="ticket" mainTypeId={this.props.item._id} />
        <PortableTasks mainType="ticket" mainTypeId={this.props.item._id} />
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
    const { item, options, onUpdate, addItem } = this.props;

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
          <Left
            options={options}
            saveItem={saveItem}
            copyItem={copy}
            removeItem={remove}
            onUpdate={onUpdate}
            item={item}
            addItem={addItem}
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
      formContent: this.renderFormContent,
      extraFields: this.state
    };

    return <EditForm {...extendedProps} />;
  }
}
