import React from 'react';
import Alert from '@erxes/ui/src/utils/Alert';
import { __ } from '@erxes/ui/src/utils/core';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import SortableList from '@erxes/ui/src/components/SortableList';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import { IPollOption } from '../../types';
import { List, Actions } from '../../styles';

type Props = {
  options?: IPollOption[];
  addButtonLabel?: string;
  showAddButton?: boolean;
  emptyMessage?: string;
  onChangeOption?: (options?: IPollOption[]) => void;
};

type State = {
  options: IPollOption[];
  optionsObj: IPollOption[];
  adding?: boolean;
  editing: boolean;
  editedIdx: string;
  editedOrder: number;
};

const convertOptions = (options: IPollOption[]) => {
  const optionObj = (options || []).map(option => {
    return {
      _id:
        option._id ||
        Math.random()
          .toString(36)
          .slice(2),
      order: option.order,
      title: option.title
    };
  });
  return optionObj;
};

class PollOptions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const optionsObj = convertOptions(props.options);

    let adding = true;

    if (props.showAddButton) {
      adding = false;
    }

    this.state = {
      adding: false,
      options: props.options || [],
      optionsObj: optionsObj || [],
      editing: false,
      editedIdx: '',
      editedOrder: 0
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { options } = nextProps;

    if (options !== this.state.options) {
      const optionsObj = convertOptions(options);
      this.setState({ options, optionsObj });
    }
  }

  handleChangeOption = () => {
    if (this.props.onChangeOption) {
      this.props.onChangeOption(this.state.optionsObj);
    }
  };

  handleAddOption = () => {
    this.setState({ adding: true });
  };

  handleCancelAddingOption = () => {
    this.setState({ adding: false });
  };

  handleSaveOption = () => {
    const { optionsObj } = this.state;
    const optionValue = (document.getElementById(
      'optionValue'
    ) as HTMLInputElement).value;
    const optionOrder = (document.getElementById(
      'optionOrder'
    ) as HTMLInputElement).value;

    if (!optionValue) {
      return Alert.warning('Nothing inserted');
    }

    if (optionOrder === '') {
      return Alert.warning('Insert order number');
    }

    this.setState(
      {
        optionsObj: [
          ...optionsObj,
          {
            _id: '',
            order: parseInt(optionOrder, 10),
            title: optionValue
          }
        ]
      },
      () => {
        this.handleChangeOption();
        (document.getElementById('optionValue') as HTMLInputElement).value = '';
        (document.getElementById(
          'optionOrder'
        ) as HTMLInputElement).value = `${parseInt(optionOrder, 10) + 1}`;
      }
    );
  };

  showEditForm = (option: { text: string; _id: string; order: string }) => {
    this.setState({
      editing: true,
      editedIdx: option._id,
      editedOrder: parseInt(option.order, 10)
    });
  };

  handleEditOption = (e, type: string) => {
    const { optionsObj, editedIdx } = this.state;

    const updatedOptionsObj = optionsObj.map(option =>
      option._id === editedIdx
        ? {
            title: type === 'title' ? e.target.value : option.title,
            _id: option._id,
            order:
              type === 'order' ? parseInt(e.target.value, 10) : option.order
          }
        : option
    );

    this.setState({ optionsObj: updatedOptionsObj });
  };

  handleRemoveOption = i => {
    const { optionsObj } = this.state;

    this.setState(
      {
        optionsObj: optionsObj.filter(option => option._id !== i._id)
      },
      () => {
        this.handleChangeOption();
      }
    );
  };

  onKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleSaveOption();
    }
  };

  saveEditedOption = (value: string) => {
    if (value.trim().length === 0) {
      return Alert.warning('Option title required!');
    }

    this.setState({ editing: false, editedIdx: '' }, () => {
      this.handleChangeOption();
    });
  };

  renderButtonOrElement = () => {
    if (this.state.adding) {
      return (
        <>
          <FlexContent>
            <FlexItem count={4}>
              <FormControl
                id="optionValue"
                autoFocus={true}
                placeholder="title"
                onKeyPress={this.onKeyPress}
              />
            </FlexItem>
            <FlexItem hasSpace={true} count={4}>
              <FormControl
                id="optionOrder"
                type="number"
                defaultValue={0}
                onKeyPress={this.onKeyPress}
              />
            </FlexItem>
          </FlexContent>
          <Actions>
            <Button
              icon="cancel-1"
              btnStyle="simple"
              size="small"
              onClick={this.handleCancelAddingOption}
            >
              Cancel
            </Button>
            <Button
              btnStyle="success"
              size="small"
              icon="checked-1"
              onClick={this.handleSaveOption}
            >
              Save
            </Button>
          </Actions>
        </>
      );
    }

    return (
      <Button onClick={this.handleAddOption} size="small" icon="plus-circle">
        {__(this.props.addButtonLabel || 'Add an option')}
      </Button>
    );
  };

  renderTitle = (option: IPollOption, type: string) => {
    const value = type === 'title' ? option.title : option.order;

    if (this.state.editing && this.state.editedIdx === option._id) {
      return (
        <input
          className="editInput"
          onChange={e => this.handleEditOption(e, type)}
          value={value}
          onBlur={e => {
            e.preventDefault();
            this.saveEditedOption(e.currentTarget.value);
          }}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              this.saveEditedOption(e.currentTarget.value);
            }
          }}
        />
      );
    }

    return value;
  };
  
  renderOption = (option: IPollOption) => {
    return (
      <li key={option._id} onDoubleClick={this.showEditForm.bind(this, option)}>
        <FlexContent>
          <FlexItem count={4}>{this.renderTitle(option, 'title')}</FlexItem>
          <FlexItem hasSpace={true} count={4}>
            {this.renderTitle(option, 'order')}
          </FlexItem>
        </FlexContent>
        <Icon
          icon="cancel-1"
          onClick={this.handleRemoveOption.bind(this, option)}
        />
      </li>
    );
  };

  onChangeOptions = optionsObj => {
    this.setState({ optionsObj }, () => {
      this.handleChangeOption();
    });
  };

  render() {
    const child = option => this.renderOption(option);

    const renderListOption = (
      <SortableList
        fields={this.state.optionsObj}
        child={child}
        onChangeFields={this.onChangeOptions}
        isModal={true}
        showDragHandler={false}
        droppableId="post option fields"
        emptyMessage={this.props.emptyMessage}
      />
    );

    return (
      <List>
        {renderListOption}
        {this.renderButtonOrElement()}
      </List>
    );
  }
}

export default PollOptions;
