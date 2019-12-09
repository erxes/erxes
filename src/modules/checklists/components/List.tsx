import Button from 'modules/common/components/Button';
import { Form, FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import ProgressBar from 'modules/common/components/ProgressBar';
import colors from 'modules/common/styles/colors';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import Item from '../containers/Item';
import {
  ChecklistTitle,
  ChecklistTitleWrapper,
  ChecklistWrapper,
  FormControlWrapper,
  FormWrapper,
  Progress
} from '../styles';
import { IChecklist } from '../types';

type Props = {
  list: IChecklist;
  addItem: (content: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (checklistId: string) => void;
};

type State = {
  isEditingTitle: boolean;
  title: string;
  beforeTitle: string;
  isAddingItem: boolean;
  itemContent: string;
  isHidden: boolean;
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const title = props.list.title;

    this.state = {
      isEditingTitle: false,
      isAddingItem: true,
      isHidden: false,
      itemContent: '',
      title,
      beforeTitle: title
    };
  }

  onAddItemClick = () => {
    this.setState({ isAddingItem: true });
  };

  removeClick = () => {
    const { remove, list } = this.props;
    remove(list._id);
  };

  saveAddItem = () => {
    const content = this.state.itemContent.match(/^.*((\r\n|\n|\r)|$)/gm);

    this.setState({ isAddingItem: false }, () => {
      (content || []).map(text => this.props.addItem(text));

      this.setState({ itemContent: '', isAddingItem: true });
    });
  };

  onSubmitAddItem = e => {
    e.preventDefault();

    this.saveAddItem();
  };

  onKeyPressAddItem = e => {
    if (e.key === 'Enter') {
      e.preventDefault();

      this.saveAddItem();
    }
  };

  renderIsCheckedBtn = () => {
    const { isHidden } = this.state;

    const onClickHideShowBtn = () => this.setState({ isHidden: !isHidden });
    const btnText = isHidden ? 'Show checked items' : 'Hide completed items';

    if (this.props.list.percent) {
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
      <>
        <h5 onClick={onClick}>{title}</h5>
        <div>
          {this.renderIsCheckedBtn()}
          <Button btnStyle="simple" size="small" onClick={this.removeClick}>
            Delete
          </Button>
        </div>
      </>
    );
  };

  generateDoc = (values: { title: string }) => {
    return {
      _id: this.props.list._id,
      title: values.title || this.state.title
    };
  };

  renderTitleInput = (formProps: IFormProps) => {
    const { isEditingTitle, title, beforeTitle } = this.state;
    const { isSubmitted, values } = formProps;

    if (!isEditingTitle) {
      return null;
    }

    const cancelEditing = () =>
      this.setState({ isEditingTitle: false, title: beforeTitle });

    const onChangeTitle = e =>
      this.setState({ title: (e.currentTarget as HTMLTextAreaElement).value });

    const onSubmit = () => {
      this.setState({ isEditingTitle: false, beforeTitle: title });
    };

    return (
      <FormControlWrapper>
        <FormControl
          {...formProps}
          name="title"
          autoFocus={true}
          componentClass="textarea"
          onChange={onChangeTitle}
          value={title}
          required={true}
        />

        {this.props.renderButton({
          values: this.generateDoc(values),
          isSubmitted,
          callback: onSubmit
        })}

        <Button
          btnStyle="simple"
          onClick={cancelEditing}
          size="small"
          icon="times"
        />
      </FormControlWrapper>
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
          height="10px"
        />
      </Progress>
    );
  };

  renderItems() {
    const { list } = this.props;

    if (this.state.isHidden) {
      return list.items
        .filter(item => !item.isChecked)
        .map(item => <Item key={item._id} item={item} />);
    }

    return list.items.map(item => <Item key={item._id} item={item} />);
  }

  renderAddInput() {
    const cancel = () => this.setState({ isAddingItem: false });
    const onContentChange = e =>
      this.setState({
        itemContent: (e.currentTarget as HTMLTextAreaElement).value
      });

    if (this.state.isAddingItem) {
      return (
        <FormWrapper add={true} onSubmit={this.onSubmitAddItem}>
          <FormControlWrapper>
            <FormControl
              autoFocus={true}
              componentClass="textarea"
              onChange={onContentChange}
              onKeyPress={this.onKeyPressAddItem}
              placeholder="Add an item"
              required={true}
            />

            <Button
              btnStyle="success"
              type="submit"
              size="small"
              icon="check-1"
            />
            <Button
              btnStyle="simple"
              size="small"
              onClick={cancel}
              icon="times"
            />
          </FormControlWrapper>
        </FormWrapper>
      );
    }

    return (
      <Button size="small" btnStyle="simple" onClick={this.onAddItemClick}>
        {__('Add an item')}
      </Button>
    );
  }

  render() {
    return (
      <>
        <ChecklistTitleWrapper>
          <Icon icon="checked" />

          <ChecklistTitle>
            {this.renderTitle()}
            <Form renderContent={this.renderTitleInput} />
          </ChecklistTitle>
        </ChecklistTitleWrapper>

        {this.renderProgressBar()}

        <ChecklistWrapper>
          {this.renderItems()}
          {this.renderAddInput()}
        </ChecklistWrapper>
      </>
    );
  }
}

export default List;
