import { AddContainer } from 'modules/boards/styles/item';
import Button from 'modules/common/components/Button';
import { getMentionedUserIds } from 'modules/common/components/EditorCK';
import { ControlLabel, FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import EditorCK from 'modules/common/containers/EditorCK';
import React from 'react';
import xss from 'xss';
import { IChecklistItem } from '../types';

type Props = {
  item: IChecklistItem;
  isHidden: boolean;
  editItem: (doc: IChecklistItem, callback: () => void) => void;
  removeItem: (checklistItemId: string) => void;
};

type State = {
  isEditing: boolean;
  content: string;
  disabled: boolean;
  isChecked: boolean;
};

class Checklists extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      content: props.item.content,
      disabled: false,
      isChecked: props.item.isChecked
    };
  }

  renderContent = () => {
    const { removeItem, item } = this.props;
    const { isEditing, content } = this.state;

    if (isEditing) {
      return null;
    }

    const onClick = () => {
      this.setState({ isEditing: true });
    };

    const removeClick = () => removeItem(item._id);

    return (
      <>
        <ControlLabel>
          <label
            onClick={onClick}
            dangerouslySetInnerHTML={{ __html: xss(content) }}
          />
        </ControlLabel>
        <Button btnStyle="simple" onClick={removeClick}>
          <Icon icon="cancel-1" />
        </Button>
      </>
    );
  };

  renderInput = () => {
    const { isEditing, content } = this.state;

    if (!isEditing) {
      return null;
    }

    const onChangeContent = e => {
      this.setState({
        content: e.editor.getData()
      });
    };

    const isEditingChange = () => this.setState({ isEditing: false });

    const onSubmit = e => {
      e.preventDefault();
      const { editItem, item } = this.props;

      // before save, disable save button
      this.setState({ disabled: true });

      const mentionedUserIds = getMentionedUserIds(content);

      const doc = {
        _id: item._id,
        checklistId: item.checklistId,
        content,
        isChecked: item.isChecked,
        mentionedUserIds
      };

      editItem(doc, () => {
        // after save, enable save button
        this.setState({ disabled: false });

        isEditingChange();
      });
    };

    return (
      <AddContainer onSubmit={onSubmit}>
        <EditorCK
          showMentions={true}
          content={this.state.content}
          onChange={onChangeContent}
          height={100}
          toolbar={[]}
          toolbarCanCollapse={false}
        />
        <Button btnStyle="simple" onClick={isEditingChange}>
          <Icon icon="cancel" />
        </Button>

        <Button
          disabled={this.state.disabled}
          btnStyle="success"
          icon="checked-1"
          type="submit"
        >
          Save
        </Button>
      </AddContainer>
    );
  };

  onCheckChange = e => {
    const { editItem, item } = this.props;

    const checked = (e.currentTarget as HTMLInputElement).checked;

    const doc = {
      _id: item._id,
      checklistId: item.checklistId,
      content: item.content,
      isChecked: checked
    };

    editItem(doc, () => {
      this.setState({ isChecked: checked });
    });
  };

  render = () => {
    const { isHidden, item } = this.props;

    if (isHidden && item.isChecked) {
      return null;
    }

    const { content, isChecked } = this.state;

    return (
      <>
        <FormControl
          componentClass="checkbox"
          checked={isChecked}
          placeholder={content}
          onChange={this.onCheckChange}
        />
        {this.renderContent()}
        {this.renderInput()}
      </>
    );
  };
}

export default Checklists;
