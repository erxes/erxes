import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import xss from 'xss';
import {
  ChecklistRow,
  ChecklistText,
  FormControlWrapper,
  FormWrapper
} from '../styles';
import { IChecklistItem } from '../types';

type Props = {
  item: IChecklistItem;
  editItem: (
    doc: { content: string; isChecked: boolean },
    callback: () => void
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

    this.state = {
      isEditing: false,
      content: props.item.content,
      disabled: false,
      isChecked: props.item.isChecked,
      beforeContent: props.item.content
    };
  }

  onClick = () => {
    this.setState({ isEditing: true });
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

  handleSave = () => {
    const { content, isChecked } = this.state;
    const { editItem } = this.props;

    this.setState({ disabled: true });

    editItem({ content, isChecked }, () => {
      this.setState({ disabled: false, isEditing: false });
    });
  };

  removeClick = () => {
    const { removeItem, item } = this.props;

    removeItem(item._id);
  };

  onCheckChange = e => {
    const { editItem } = this.props;

    const checked = (e.currentTarget as HTMLInputElement).checked;

    this.setState({ isChecked: checked }, () => {
      const { content, isChecked } = this.state;

      editItem({ content, isChecked }, () => {
        this.setState({ isEditing: false });
      });
    });
  };

  renderContent = () => {
    const { isEditing, content } = this.state;

    if (isEditing) {
      return null;
    }

    return (
      <ChecklistText>
        <label
          onClick={this.onClick}
          dangerouslySetInnerHTML={{ __html: xss(content) }}
        />
        <Button btnStyle="simple" size="small" onClick={this.removeClick}>
          <Icon icon="cancel" />
        </Button>
      </ChecklistText>
    );
  };

  renderInput = () => {
    const { isEditing } = this.state;

    if (!isEditing) {
      return null;
    }

    const onChangeContent = e => {
      this.setState({
        content: (e.currentTarget as HTMLTextAreaElement).value
      });
    };

    const onClickEdit = () => {
      this.setState({ isEditing: false, content: this.state.beforeContent });
    };

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
          />
          <Button btnStyle="simple" size="small" onClick={onClickEdit}>
            <Icon icon="cancel" />
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="checked-1"
            type="submit"
            size="small"
          >
            Save
          </Button>
        </FormControlWrapper>
      </FormWrapper>
    );
  };

  render = () => {
    const { isChecked } = this.state;

    return (
      <ChecklistRow>
        <FormControl
          componentClass="checkbox"
          checked={isChecked}
          onChange={this.onCheckChange}
        />
        {this.renderContent()}
        {this.renderInput()}
      </ChecklistRow>
    );
  };
}

export default ListRow;
