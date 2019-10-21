import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import ProgressBar from 'modules/common/components/ProgressBar';
import colors from 'modules/common/styles/colors';
import { __ } from 'modules/common/utils';
import React from 'react';
import Item from '../containers/Item';
import {
  ChecklistActions,
  ChecklistTitle,
  ChecklistTitleWrapper,
  ChecklistWrapper,
  FormWrapper,
  Progress
} from '../styles';
import { IChecklist } from '../types';

type Props = {
  list: IChecklist;
  addItem: (doc: { content: string }) => void;
  edit: (doc: { title: string }) => void;
  remove: (checklistId: string) => void;
};

type State = {
  isEditingTitle: boolean;
  title: string;
  beforeTitle: string;
  disabled: boolean;
  isAddingItem: boolean;
  addFormContent: string;
  isHidden: boolean;
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isEditingTitle: false,
      isAddingItem: false,
      isHidden: false,
      addFormContent: '',
      title: this.props.list.title,
      beforeTitle: this.props.list.title,
      disabled: false
    };
  }

  onAddItemClick = () => {
    this.setState({ isAddingItem: true });
  };

  removeClick = () => {
    const { remove, list } = this.props;

    remove(list._id);
  };

  saveAddItemMutation = () => {
    const { addItem } = this.props;

    this.setState({ isAddingItem: false }, () => {
      addItem({
        content: this.state.addFormContent
      });
    });
  };

  onSubmitAddItem = e => {
    e.preventDefault();

    this.saveAddItemMutation();
  };

  onKeyPressAddItem = e => {
    if (e.key === 'Enter') {
      e.preventDefault();

      this.saveAddItemMutation();
    }
  };

  renderIsCheckedBtn = () => {
    const { list } = this.props;
    const { isHidden } = this.state;

    const onClickHideShowBtn = () => this.setState({ isHidden: !isHidden });
    const btnText = isHidden ? 'Show checked items' : 'Hide completed items';

    if (list && list.percent) {
      return (
        <Button btnStyle="simple" size="small" onClick={onClickHideShowBtn}>
          {__(btnText)}
        </Button>
      );
    }
    return null;
  };

  renderTitle = () => {
    const { isEditingTitle, title } = this.state;

    const onClick = () => this.setState({ isEditingTitle: true });

    if (isEditingTitle) {
      return null;
    }

    return (
      <ChecklistTitle>
        <h5 onClick={onClick}>{title}</h5>
        <ChecklistActions>
          {this.renderIsCheckedBtn()}
          <Button btnStyle="simple" size="small" onClick={this.removeClick}>
            Delete
          </Button>
        </ChecklistActions>
      </ChecklistTitle>
    );
  };

  renderTitleInput = () => {
    const { isEditingTitle, title } = this.state;
    const { edit } = this.props;

    if (!isEditingTitle) {
      return null;
    }

    const cancelEditing = () =>
      this.setState({ isEditingTitle: false, title: this.state.beforeTitle });
    const onChange = e =>
      this.setState({ title: (e.currentTarget as HTMLTextAreaElement).value });

    const onSubmit = () => {
      this.setState({ isEditingTitle: false }, () => {
        edit({ title: this.state.title });
      });
    };

    return (
      <FormWrapper onSubmit={onSubmit}>
        <FormControl
          autoFocus={true}
          componentClass="textarea"
          onChange={onChange}
          value={title}
        />
        <Button btnStyle="simple" onClick={cancelEditing} size="small">
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
      </FormWrapper>
    );
  };

  renderAddItemForm = () => {
    const { isAddingItem } = this.state;

    if (!isAddingItem) {
      return null;
    }

    const cancel = () => this.setState({ isAddingItem: false });
    const onContentChange = e =>
      this.setState({
        addFormContent: (e.currentTarget as HTMLTextAreaElement).value
      });

    return (
      <FormWrapper isNewItem={true} onSubmit={this.onSubmitAddItem}>
        <FormControl
          autoFocus={true}
          componentClass="textarea"
          onChange={onContentChange}
          onKeyPress={this.onKeyPressAddItem}
        />
        <Button
          btnStyle="simple"
          size="small"
          onClick={cancel}
          icon="cancel-1"
        />

        <Button
          disabled={this.state.disabled}
          btnStyle="success"
          icon="checked-1"
          type="submit"
          size="small"
        >
          Save
        </Button>
      </FormWrapper>
    );
  };

  renderProgressBar = () => {
    const { list } = this.props;
    return (
      <Progress>
        <span>{list.percent.toFixed(0)}%</span>
        <ProgressBar
          percentage={list.percent}
          color={colors.colorPrimary}
          height="8px"
        />
      </Progress>
    );
  };

  renderItems = () => {
    const { list } = this.props;

    if (this.state.isHidden) {
      return list.items
        .filter(item => !item.isChecked)
        .map(item => <Item key={item._id} item={item} />);
    }
    return list.items.map(item => <Item key={item._id} item={item} />);
  };

  renderAddItemBtn() {
    if (!this.state.isAddingItem) {
      return (
        <Button size="small" btnStyle="simple" onClick={this.onAddItemClick}>
          <Icon icon="focus-add" />
          {__(' Add an item')}
        </Button>
      );
    }
    return null;
  }

  render() {
    return (
      <>
        <ChecklistTitleWrapper>
          <Icon icon="checked" />
          {this.renderTitle()}
          {this.renderTitleInput()}
        </ChecklistTitleWrapper>

        {this.renderProgressBar()}

        <ChecklistWrapper>
          {this.renderItems()}
          {this.renderAddItemForm()}
          {this.renderAddItemBtn()}
        </ChecklistWrapper>
      </>
    );
  }
}

export default List;
