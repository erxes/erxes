import React from 'react';
import { ModalFooter } from 'modules/common/styles/main';
import { Notes } from 'modules/automations/styles';
import FormControl from 'modules/common/components/form/Control';
import { IFormProps } from 'modules/common/types';
import Button from 'modules/common/components/Button';
import { __, renderUserFullName } from 'modules/common/utils';
import { IAutomationNote } from 'modules/automations/types';
import {
  MainInfo,
  CustomerName,
  FlexWidth
} from 'modules/inbox/components/leftSidebar/styles';
import NameCard from 'modules/common/components/nameCard/NameCard';
import dayjs from 'dayjs';
import ActionButtons from 'modules/common/components/ActionButtons';
import Tip from 'modules/common/components/Tip';

type Props = {
  formProps: IFormProps;
  isEdit?: boolean;
  notes?: IAutomationNote[];
  automationId: string;
  itemId: string;
  closeModal: () => void;
  remove: (_id: string) => void;
  save: (doc) => void;
  edit: (doc) => void;
};

type State = {
  description: string;
  isEditNote: boolean;
  currentNote: IAutomationNote;
};

class NoteForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      description: '',
      isEditNote: false,
      currentNote: {} as IAutomationNote
    };
  }

  onEdit = currentNote => {
    this.setState({ isEditNote: !this.state.isEditNote, currentNote });
  };

  onChange = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLButtonElement).value;
    this.setState({ description: value });
  };

  generateDoc = (values: { _id?: string }) => {
    const { automationId, itemId } = this.props;

    const splitItem = itemId.split('-');
    const type = splitItem[0];

    if (this.state.currentNote) {
      values._id = this.state.currentNote._id;
    }

    return {
      ...values,
      automationId,
      description: this.state.description,
      actionId: type === 'action' ? splitItem[1] : '',
      triggerId: type === 'trigger' ? splitItem[1] : ''
    };
  };

  renderNotes() {
    const { notes, isEdit, remove, formProps, edit } = this.props;
    const { isEditNote, currentNote } = this.state;

    if (!notes || notes.length === 0 || !isEdit) {
      return null;
    }

    return notes.map(note => (
      <div className="column" key={note._id}>
        <MainInfo>
          <div>
            <NameCard.Avatar
              size={36}
              letterCount={1}
              user={note.createdUser || {}}
            />
            <CustomerName>
              <FlexWidth>{renderUserFullName(note.createdUser)}</FlexWidth>
              <time>{dayjs(note.createdAt).fromNow(true)}</time>
            </CustomerName>
          </div>
          <ActionButtons>
            <Tip text="Edit" placement="bottom">
              <Button
                btnStyle="link"
                icon="edit"
                onClick={this.onEdit.bind(this, note)}
              />
            </Tip>
            <Tip text="Delete" placement="bottom">
              <Button
                btnStyle="link"
                icon="cancel-1"
                onClick={() => remove(note._id)}
              />
            </Tip>
          </ActionButtons>
        </MainInfo>

        {isEditNote && currentNote._id === note._id ? (
          <>
            <FormControl
              name="description"
              componentClass="textarea"
              onChange={this.onChange}
              rows={5}
              defaultValue={note.description}
            />

            <Button
              btnStyle="success"
              type="button"
              onClick={() => edit(this.generateDoc(formProps.values))}
              icon="check-circle"
              size="small"
            >
              {__('Save')}
            </Button>
          </>
        ) : (
          <p>{note.description}</p>
        )}
      </div>
    ));
  }

  render() {
    const { formProps, closeModal, save } = this.props;
    const { values } = formProps;

    return (
      <div>
        <Notes>{this.renderNotes()}</Notes>
        <FormControl
          name="description"
          componentClass="textarea"
          rows={5}
          onChange={this.onChange}
          placeholder={`${__('Leave a note')}...`}
        />
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button
            btnStyle="success"
            type="button"
            onClick={() => save(this.generateDoc(values))}
            icon="check-circle"
          >
            {__('Save')}
          </Button>
        </ModalFooter>
      </div>
    );
  }
}

export default NoteForm;
