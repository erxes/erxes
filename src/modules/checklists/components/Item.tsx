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
  isActive: boolean;
  disabled: boolean;
  beforeContent: string;
};

class ListRow extends React.Component<Props, State> {
  private ref;

  constructor(props) {
    super(props);

    const item = props.item;

    this.ref = React.createRef();

    this.state = {
      isEditing: false,
      isActive: false,
      content: item.content,
      disabled: false,
      isChecked: item.isChecked,
      beforeContent: item.content
    };
  }

  onClick = () => {
    this.setState({
      isEditing: !this.state.isEditing,
      beforeContent: this.props.item.content
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

    const isChecked = (e.currentTarget as HTMLInputElement).checked;

    this.setState({ isChecked, isEditing: false }, () => {
      const { content } = this.state;

      editItem({ content, isChecked });
    });
  };

  handleClickOutside = event => {
    if (this.ref.current && !this.ref.current.contains(event.target)) {
      this.setState({ isEditing: false });
    }
  };

  useEffect = () => {
    document.addEventListener('click', this.handleClickOutside, true);

    return () => {
      document.removeEventListener('click', this.handleClickOutside, true);
    };
  };

  renderContent() {
    const onChangeContent = e => {
      this.setState({
        content: (e.currentTarget as HTMLTextAreaElement).value
      });
    };

    const onClickEdit = () => {
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
            />
            <Button
              disabled={this.state.disabled}
              btnStyle="success"
              type="submit"
              size="small"
              icon="check"
            />
            <Button
              btnStyle="simple"
              size="small"
              onClick={onClickEdit}
              icon="times"
            />
          </FormControlWrapper>
        </FormWrapper>
      );
    }

    return (
      <ChecklistText isChecked={this.state.isChecked}>
        <label dangerouslySetInnerHTML={{ __html: xss(this.state.content) }} />
        <Icon icon="times" onClick={this.removeClick} />
      </ChecklistText>
    );
  }

  render() {
    return (
      <ChecklistItem onClick={this.onClick}>
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
