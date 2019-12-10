import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import xss from 'xss';
import {
  ChecklistItem,
  ChecklistText,
  FormControlWrapper,
  FormWrapper
} from '../styles';
import { IChecklistItem } from '../types';

type Props = {
  item: IChecklistItem;
  editItem: (
    doc: { content: string; isChecked: boolean },
    callback?: () => void
  ) => void;
  removeItem: (checklistItemId: string) => void;
};

type State = {
  isEditing: boolean;
  content: string;
  isChecked: boolean;
  disabled: boolean;
  beforeContent: string;
};

class ListRow extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      isEditing: false,
      content: item.content,
      disabled: false,
      isChecked: item.isChecked,
      beforeContent: item.content
    };
  }

  onClick = () => {
    this.setState({ isEditing: true, beforeContent: this.props.item.content });
  };

  handleSave = () => {
    const { content, isChecked } = this.state;

    this.setState({ disabled: true });

    this.props.editItem({ content, isChecked }, () => {
      this.setState({ disabled: false, isEditing: false });
    });
  };

  onKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();

      this.handleSave();
    }
  };

  onSubmit = e => {
    e.preventDefault();

    this.handleSave();
  };

  removeClick = () => {
    const { removeItem, item } = this.props;

    removeItem(item._id);
  };

  // onBlur = () => {
  //   this.setState({ isEditing: false })
  // }

  onCheckChange = e => {
    const { editItem } = this.props;

    const isChecked = (e.currentTarget as HTMLInputElement).checked;

    this.setState({ isChecked, isEditing: false }, () => {
      const { content } = this.state;

      editItem({ content, isChecked });
    });
  };

  renderContent() {
    const onChangeContent = e => {
      this.setState({
        content: (e.currentTarget as HTMLTextAreaElement).value
      });
    };

    const onCancel = () => {
      this.setState({ isEditing: false, content: this.state.beforeContent });
    };

    if (this.state.isEditing) {
      return (
        <FormWrapper onSubmit={this.onSubmit}>
          <FormControlWrapper>
            <FormControl
              componentClass="textarea"
              autoFocus={true}
              onChange={onChangeContent}
              value={this.state.content}
              onKeyPress={this.onKeyPress}
              required={true}
              // onBlur={this.onBlur}
            />
            <Button
              disabled={this.state.disabled}
              btnStyle="success"
              type="submit"
              size="small"
              icon="check-1"
            />
            <Button
              btnStyle="simple"
              size="small"
              onClick={onCancel}
              icon="times"
            />
          </FormControlWrapper>
        </FormWrapper>
      );
    }

    return (
      <ChecklistText isChecked={this.state.isChecked}>
        <label
          onClick={this.onClick}
          dangerouslySetInnerHTML={{ __html: xss(this.state.content) }}
        />
        <Icon icon="times" onClick={this.removeClick} />
      </ChecklistText>
    );
  }

  render() {
    return (
      <ChecklistItem>
        <FormControl
          componentClass="checkbox"
          checked={this.state.isChecked}
          onChange={this.onCheckChange}
        />
        {this.renderContent()}
      </ChecklistItem>
    );
  }
}

export default ListRow;
