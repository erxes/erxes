import debounce from 'lodash/debounce';
import Button from 'modules/common/components/Button';
import { Form, FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import ProgressBar from 'modules/common/components/ProgressBar';
import colors from 'modules/common/styles/colors';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, isEmptyContent } from 'modules/common/utils';
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
  item: IChecklist;
  addItem: (content: string) => void;
  convertToCard: (name: string, callback: () => void) => void;
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

    const title = props.item.title;

    this.state = {
      isEditingTitle: false,
      isAddingItem: props.item.items.length === 0 ? true : false,
      isHidden: false,
      itemContent: this.getUnsavedContent(props.item._id) || '',
      title,
      beforeTitle: title
    };
  }

  onAddItemClick = () => {
    this.setState({ isAddingItem: true });
  };

  onFocus = event => event.target.select();

  onCancel = (toggle?: boolean) => {
    const { itemContent } = this.state;

    localStorage.setItem(this.props.item._id, itemContent);

    debounce(
      () =>
        this.setState({
          isAddingItem: toggle ? !this.state.isAddingItem : false
        }),
      100
    )();
  };

  onBlur = () => {
    if (isEmptyContent(this.state.itemContent)) {
      return;
    }

    this.onCancel(true);
  };

  removeClick = () => {
    const { remove, item } = this.props;
    remove(item._id);
  };

  getUnsavedContent = (id: string) => {
    return localStorage.getItem(id) || '';
  };

  onContentChange = e => {
    this.setState({
      itemContent: (e.currentTarget as HTMLTextAreaElement).value
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
      this.onBlur();
    }
  };

  saveAddItem = () => {
    // check if a string contains whitespace or empty
    if (isEmptyContent(this.state.itemContent)) {
      return;
    }

    const content = this.state.itemContent.match(/^.*((\r\n|\n|\r)|$)/gm);

    (content || []).map(text => this.props.addItem(text));

    this.setState({ itemContent: '', isAddingItem: false }, () =>
      localStorage.removeItem(this.props.item._id)
    );
  };

  renderIsCheckedBtn = () => {
    const { isHidden } = this.state;

    const onClickHideShowBtn = () => this.setState({ isHidden: !isHidden });
    const btnText = isHidden ? 'Show checked items' : 'Hide completed items';

    if (this.props.item.percent) {
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
      _id: this.props.item._id,
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
    const { item } = this.props;

    return (
      <Progress>
        <span>{item.percent.toFixed(0)}%</span>
        <ProgressBar
          percentage={item.percent}
          color={colors.colorPrimary}
          height="10px"
        />
      </Progress>
    );
  };

  renderItems() {
    const { item } = this.props;

    if (this.state.isHidden) {
      return item.items
        .filter(data => !data.isChecked)
        .map(data => (
          <Item
            key={data._id}
            item={data}
            convertToCard={this.props.convertToCard}
          />
        ));
    }

    return item.items.map(data => (
      <Item
        key={data._id}
        item={data}
        convertToCard={this.props.convertToCard}
      />
    ));
  }

  renderAddInput() {
    const { isAddingItem } = this.state;

    if (isAddingItem) {
      return (
        <FormWrapper add={true} onSubmit={this.onSubmitAddItem}>
          <FormControlWrapper onBlur={this.onBlur}>
            <FormControl
              componentClass="textarea"
              placeholder="Add an item"
              onChange={this.onContentChange}
              onKeyPress={this.onKeyPressAddItem}
              defaultValue={this.getUnsavedContent(this.props.item._id)}
              autoFocus={true}
              onFocus={this.onFocus}
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
              onClick={this.onCancel.bind(this, false)}
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
