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
import React from 'react';
import Select from 'react-select-plus';
import { IGrowthHack, IGrowthHackParams } from '../types';

type Props = {
  options: IOptions;
  item: IGrowthHack;
  users: IUser[];
  addItem: (doc: IGrowthHackParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: IGrowthHackParams, callback: () => void) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  closeModal: () => void;
};

type State = {
  hackDescription: string;
  goal: string;
};

export default class GrowthHackEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      hackDescription: item.hackDescription || '',
      goal: item.goal || ''
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  renderFormContent = ({
    state,
    onChangeAttachment,
    onChangeField,
    copy,
    remove
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
          description={description}
          closeDate={closeDate}
          users={users}
          stageId={stageId}
          item={item}
          onChangeField={onChangeField}
        />

        <FlexContent>
          <Left
            onChangeAttachment={onChangeAttachment}
            type={options.type}
            description={description}
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
      extraFields: this.state
    };

    return <EditForm {...extendedProps} />;
  }
}
