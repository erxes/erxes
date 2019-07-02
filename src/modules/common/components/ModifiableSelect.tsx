import React from 'react';
import Select from 'react-select-plus';
import { Button, FormControl, FormGroup, Icon } from '.';
import { IFormProps } from '../types';
import { __, Alert } from '../utils';

type OptionProps = {
  option: any;
  onSelect: (option: any[], e: any) => void;
};

class Option extends React.PureComponent<OptionProps> {
  render() {
    const { option, onSelect } = this.props;
    const { onRemove } = option;
    const style = {
      display: 'inline-block',
      width: '100%',
      padding: '8px 20px'
    };

    const onClick = e => onSelect(option, e);
    const onRemoveClick = () => onRemove(option.value);

    return (
      <div style={style} onClick={onClick}>
        <span style={{ float: 'left' }}>{option.label}</span>
        <Icon
          style={{ float: 'right' }}
          onClick={onRemoveClick}
          icon="cancel-1"
        />
      </div>
    );
  }
}

type Props = {
  options: any[];
  onChange: (params: { options: any[]; selectedOption: any }) => void;
  value?: string;
  placeholder?: string;
  buttonText?: string;
  checkFormat?: (value: string | number) => boolean;
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

    if (checkFormat) {
      if (checkFormat(this.state.inputValue)) {
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

  renderInput = () => {
    const { buttonText, placeholder, type, required } = this.props;

    if (this.state.adding) {
      const onPress = e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          return this.handleSave();
        }
      };

      return (
        <React.Fragment>
          <FormGroup>
            <FormControl
              type={type}
              autoFocus={true}
              onKeyPress={onPress}
              placeholder={placeholder}
              onChange={this.handleInputChange}
              required={required}
            />
          </FormGroup>
          <Button
            icon="cancel-1"
            btnStyle="simple"
            size="small"
            onClick={this.handleCancelAdding}
          >
            Cancel
          </Button>
          <Button
            btnStyle="success"
            size="small"
            icon="checked-1"
            onClick={this.handleSave}
          >
            Save
          </Button>
        </React.Fragment>
      );
    }

    return (
      <Button onClick={this.handleAdding} size="small" icon="add">
        {__(buttonText || '')}
      </Button>
    );
  };

  render() {
    const { placeholder } = this.props;
    const { selectedOption } = this.state;
    const onChange = obj => this.setItem(obj);

    return (
      <React.Fragment>
        <FormGroup>
          <Select
            placeholder={__(placeholder || '')}
            searchable={false}
            value={selectedOption}
            valueComponent={this.renderValue}
            onChange={onChange}
            options={this.generateOptions()}
            optionComponent={Option}
          />
        </FormGroup>

        {this.renderInput()}
      </React.Fragment>
    );
  }
}

export default ModifiableSelect;
