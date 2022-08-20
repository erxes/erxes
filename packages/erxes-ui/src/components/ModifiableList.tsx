import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles';
import Alert from '../utils/Alert';
import { __ } from '../utils/core';
import Button from './Button';
import FormControl from './form/Control';
import Icon from './Icon';
import SortableList from './SortableList';

const List = styled.ul`
  list-style: none;
  padding: 0;

  button {
    margin-top: 10px;
  }

  li {
    position: relative;
    margin-bottom: 5px;
    background-color: ${colors.colorWhite};
    border: 1px solid ${colors.borderPrimary};
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    border: none;

    &:hover {
      cursor: pointer;
    }
  }

  input.editInput {
    border: none;
    outline: none;
  }

  input.editInput:focus {
    outline: none;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

type Props = {
  options: string[];
  addButtonLabel?: string;
  showAddButton?: boolean;
  emptyMessage?: string;
  onChangeOption?: (options?: string[], optionValue?: string) => void;
};

type State = {
  options: string[];
  optionsObj: { text: string; _id: string }[];
  adding?: boolean;
  editing: boolean;
  editedIdx: string;
};

const convertOptions = (options: string[]) => {
  const optionObj = options.map(option => {
    return { text: option, _id: Math.random().toString() };
  });
  return optionObj;
};

class ModifiableList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const optionsObj = convertOptions(props.options);

    let adding = true;

    if (props.showAddButton) {
      adding = false;
    }

    this.state = {
      adding,
      options: props.options || [],
      optionsObj: optionsObj || [],
      editing: false,
      editedIdx: ''
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { options } = nextProps;

    if (options !== this.state.options) {
      const optionsObj = convertOptions(options);
      this.setState({ options, optionsObj });
    }
  }

  handleChangeOption = (optionValue?: string) => {
    if (this.props.onChangeOption) {
      const optionsArr = this.state.optionsObj.map(option => option.text);
      this.props.onChangeOption(optionsArr, optionValue);
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

    if (!optionValue) {
      return Alert.warning('Nothing inserted');
    }

    this.setState(
      {
        optionsObj: [
          ...optionsObj,
          { text: optionValue, _id: Math.random().toString() }
        ]
      },
      () => {
        this.handleChangeOption(optionValue);
        (document.getElementById('optionValue') as HTMLInputElement).value = '';
      }
    );
  };

  showEditForm = (option: { text: string; _id: string }) => {
    this.setState({ editing: true, editedIdx: option._id });
  };

  handleEditOption = e => {
    const { optionsObj, editedIdx } = this.state;

    const updatedOptionsObj = optionsObj.map(option =>
      option._id === editedIdx
        ? { text: e.target.value, _id: option._id }
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
      return Alert.warning('Option value required!');
    }

    this.setState({ editing: false, editedIdx: '' }, () => {
      this.handleChangeOption();
    });
  };

  renderButtonOrElement = () => {
    if (this.state.adding) {
      return (
        <>
          <FormControl
            id="optionValue"
            autoFocus={true}
            onKeyPress={this.onKeyPress}
          />
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

  renderOption = (option: { text: string; _id: string }) => {
    return (
      <li key={option._id} onDoubleClick={this.showEditForm.bind(this, option)}>
        {this.state.editing && this.state.editedIdx === option._id ? (
          <input
            className="editInput"
            onChange={this.handleEditOption}
            value={option.text}
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
        ) : (
          option.text
        )}
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
        droppableId="property option fields"
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

export default ModifiableList;
