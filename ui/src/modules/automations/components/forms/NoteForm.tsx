import React from 'react';
import { ModalFooter } from 'modules/common/styles/main';
import { NoteContainer, Notes } from 'modules/automations/styles';
import FormControl from 'modules/common/components/form/Control';
import { IFormProps, IButtonMutateProps } from 'modules/common/types';
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
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  remove: (_id: string) => void;
};

type State = {
  isEditNote: boolean;
  currentNote: IAutomationNote;
};

class NoteForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isEditNote: false,
      currentNote: {} as IAutomationNote
    };
  }

  onEdit = currentNote => {
    this.setState({ isEditNote: !this.state.isEditNote, currentNote });
  };

  generateDoc = (values: { _id?: string; description: string }) => {
    const { automationId, itemId } = this.props;

    const finalValues = values;
    const splitItem = itemId.split('-');
    const type = splitItem[0];

    if (this.state.currentNote) {
      finalValues._id = this.state.currentNote._id;
    }

    return {
      ...finalValues,
      automationId,
      actionId: type === 'action' ? splitItem[1] : '',
      triggerId: type === 'trigger' ? splitItem[1] : ''
    };
  };

  renderNotes() {
    const {
      notes,
      isEdit,
      remove,
      formProps,
      closeModal,
      renderButton
    } = this.props;
    const { values, isSubmitted } = formProps;
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
              {...formProps}
              name="description"
              componentClass="textarea"
              rows={5}
              defaultValue={note.description}
            />

            {renderButton({
              values: this.generateDoc(values),
              object: note,
              isSubmitted,
              callback: closeModal
            })}
          </>
        ) : (
          <p>{note.description}</p>
        )}
      </div>
    ));
  }

  render() {
    const { formProps, closeModal, renderButton } = this.props;

    const { values, isSubmitted } = formProps;

    return (
      <NoteContainer>
        <Notes>{this.renderNotes()}</Notes>
        <FormControl
          {...formProps}
          name="description"
          componentClass="textarea"
          rows={5}
          placeholder="Leave a note..."
          // defaultValue={event && event.description}
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

          {renderButton({
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </NoteContainer>
    );
  }
}

export default NoteForm;
