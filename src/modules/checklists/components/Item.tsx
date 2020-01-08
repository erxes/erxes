import debounce from 'lodash/debounce';
import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import { FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import { isEmptyContent } from 'modules/common/utils';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
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
  convertToCard: (name: string, callback: () => void) => void;
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

  onFocus = event => event.target.select();

  onClick = () => {
    this.setState({ isEditing: true, beforeContent: this.props.item.content });
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

  onBlur = () => {
    if (isEmptyContent(this.state.content)) {
      return;
    }

    debounce(() => this.setState({ isEditing: false }), 100)();
  };

  onCheckChange = e => {
    const { editItem } = this.props;

    const isChecked = (e.currentTarget as HTMLInputElement).checked;

    this.setState({ isChecked, isEditing: false }, () => {
      const { content } = this.state;

      editItem({ content, isChecked });
    });
  };

  handleSave = () => {
    if (isEmptyContent(this.state.content)) {
      return;
    }

    const { content, isChecked } = this.state;

    this.setState({ disabled: true });

    this.props.editItem({ content, isChecked }, () => {
      this.setState({ disabled: false, isEditing: false });
    });
  };

  onRemove = () => {
    const { removeItem, item } = this.props;

    removeItem(item._id);
  };

  onConvert = () => {
    this.props.convertToCard(this.state.content, this.onRemove);
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
        <FormWrapper onSubmit={this.onSubmit} onBlur={this.onBlur}>
          <FormControlWrapper>
            <FormControl
              componentClass="textarea"
              autoFocus={true}
              onFocus={this.onFocus}
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

        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-brand">
            <Icon icon="ellipsis-h" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <a onClick={this.onConvert} href="#">
                Convert to Card
              </a>
            </li>
            <li>
              <a onClick={this.onRemove} href="#">
                Delete
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
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
