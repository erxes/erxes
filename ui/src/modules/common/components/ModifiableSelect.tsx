import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';
import { IFormProps } from '../types';
import { __, Alert } from '../utils';
import Button from './Button';
import FormControl from './form/Control';
import Icon from './Icon';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const OptionWrapper = styled(Wrapper)`
  padding: 8px 16px;
  font-weight: 500;
  border-bottom: 1px solid #eee;

  &:last-child {
    border: none;
  }

  &:hover {
    background: #fafafa;
    cursor: default;
  }

  i {
    color: #ea475d;

    &:hover {
      cursor: pointer;
    }
  }
`;

const FillContent = styled.div`
  flex: 1;
  margin-right: 5px;
`;

type OptionProps = {
  option: any;
  onSelect: (option: any[], e: any) => void;
};

class Option extends React.PureComponent<OptionProps> {
  render() {
    const { option, onSelect } = this.props;
    const { onRemove } = option;

    const onClick = e => onSelect(option, e);
    const onRemoveClick = () => onRemove(option.value);

    return (
      <OptionWrapper onClick={onClick}>
        <FillContent>{option.label}</FillContent>
        <Icon
          style={{ float: 'right' }}
          onClick={onRemoveClick}
          icon="times-circle"
        />
      </OptionWrapper>
    );
  }
}

type Props = {
  id?: string;
  options: any[];
  onChange: (params: { options: any[]; selectedOption: any }) => void;
  value?: string;
  name: string;
  checkFormat?: (value) => boolean;
  adding?: boolean;
  formProps?: IFormProps;
  type?: string;
  required?: boolean;
};

type State = {
  adding: boolean;
  options: any[];
  selectedOption: string;
  inputValue: string;
};

class ModifiableSelect extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      adding: props.adding || false,
      options: props.options || [],
      selectedOption: props.value,
      inputValue: ''
    };
  }

  generateOptions() {
    const { options } = this.state;

    return options.map(option => ({
      value: option,
      label: option,
      onRemove: value => this.removeItem(value)
    }));
  }

  renderValue = () => {
    const { selectedOption } = this.state;

    return <span>{selectedOption}</span>;
  };

  saveValue() {
    const { options, selectedOption, inputValue } = this.state;
    const { onChange } = this.props;
    const updatedOption = options.length === 0 ? inputValue : selectedOption;

    const state: State = {
      adding: false,
      options: [...options, inputValue],
      selectedOption: updatedOption,
      inputValue
    };

    this.setState({ ...state }, () => {
      onChange({ options: this.state.options, selectedOption: updatedOption });

      this.setState({ inputValue: '' });
    });

    Alert.success('Successfully added');
  }

  handleSave = () => {
    const { checkFormat } = this.props;
    const { inputValue, options } = this.state;

    if (options.includes(inputValue)) {
      return Alert.error(
        `${inputValue} is already in the list. Please write a different option.`
      );
    }

    if (checkFormat) {
      if (checkFormat(inputValue)) {
        return this.saveValue();
      }

      return Alert.error('Invalid format');
    }

    return this.saveValue();
  };

  handleAdding = () => {
    this.setState({ adding: true });
  };

  handleCancelAdding = () => {
    this.setState({ adding: false });
  };

  removeItem = value => {
    const { options } = this.state;
    const { onChange } = this.props;

    this.setState(
      {
        options: options.filter(option => option !== value),
        selectedOption: ''
      },
      () => {
        onChange({
          options: this.state.options,
          selectedOption: null
        });
      }
    );

    Alert.success('Successfully removed');
  };

  setItem = option => {
    const { options } = this.state;
    const { onChange } = this.props;
    const value = option ? option.value : null;

    this.setState({ selectedOption: value }, () => {
      onChange({
        options,
        selectedOption: this.state.selectedOption ? value : null
      });
    });
  };

  handleInputChange = e => {
    e.preventDefault();
    this.setState({ inputValue: e.target.value });
  };

  render() {
    const { id, name, type, required } = this.props;

    if (this.state.adding) {
      const onPress = e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          return this.handleSave();
        }
      };

      return (
        <Wrapper id={id}>
          <FillContent>
            <FormControl
              type={type}
              autoFocus={true}
              onKeyPress={onPress}
              placeholder={`${__('Add')} ${__(name)}`}
              onChange={this.handleInputChange}
              required={required}
            />
          </FillContent>

          <div>
            <Button
              icon="times"
              btnStyle="simple"
              size="small"
              uppercase={false}
              onClick={this.handleCancelAdding}
            />
            <Button
              btnStyle="success"
              size="small"
              icon="check-circle"
              uppercase={false}
              onClick={this.handleSave}
            >
              Save
            </Button>
          </div>
        </Wrapper>
      );
    }

    const { selectedOption } = this.state;
    const onChange = obj => this.setItem(obj);

    return (
      <Wrapper>
        <FillContent>
          <Select
            placeholder={`${__('Choose a Primary')} ${__(name)}`}
            searchable={false}
            value={selectedOption}
            valueComponent={this.renderValue}
            onChange={onChange}
            options={this.generateOptions()}
            optionComponent={Option}
          />
        </FillContent>

        <Button
          onClick={this.handleAdding}
          size="small"
          btnStyle="primary"
          uppercase={false}
          icon="plus-circle"
        >
          {`${__('Add')} ${__(name)}`}
        </Button>
      </Wrapper>
    );
  }
}

export default ModifiableSelect;
