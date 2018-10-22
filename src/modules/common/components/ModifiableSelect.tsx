import * as React from 'react';
import Select from 'react-select-plus';
import { Button, FormControl, FormGroup, Icon } from '.';
import { __, Alert } from '../utils';

type OptionProps = {
  option: any;
  onSelect: (option: any[], e: any) => void;
};

class Option extends React.Component<OptionProps> {
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
};

type State = {
  adding: boolean;
  options: any[];
  selectedOption: string;
};

class ModifiableSelect extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      adding: false,
      options: props.options || [],
      selectedOption: props.value
    };

    this.handleAdding = this.handleAdding.bind(this);
    this.handleCancelAdding = this.handleCancelAdding.bind(this);
    this.renderInput = this.renderInput.bind(this);
    this.renderValue = this.renderValue.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.setItem = this.setItem.bind(this);
  }

  generateOptions() {
    const { options } = this.state;

    return options.map(option => ({
      value: option,
      label: option,
      onRemove: value => this.removeItem(value)
    }));
  }

  renderValue() {
    const { selectedOption } = this.state;

    return <span>{selectedOption}</span>;
  }

  handleSave = () => {
    const { options, selectedOption } = this.state;
    const { onChange } = this.props;
    const value = (document.getElementById(
      'removableSelect-value'
    ) as HTMLInputElement).value;

    const updatedOption = options.length === 0 ? value : selectedOption;

    const state: State = {
      adding: false,
      options: [...options, value],
      selectedOption: updatedOption
    };

    this.setState({ ...state }, () => {
      onChange({ options: this.state.options, selectedOption: updatedOption });
    });

    Alert.success('Successfully added');

    (document.getElementById(
      'removableSelect-value'
    ) as HTMLInputElement).value = '';
  };

  handleAdding() {
    this.setState({ adding: true });
  }

  handleCancelAdding() {
    this.setState({ adding: false });
  }

  removeItem(value) {
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
  }

  setItem(option) {
    const { options } = this.state;
    const { onChange } = this.props;
    const value = option ? option.value : null;

    this.setState({ selectedOption: value }, () => {
      onChange({
        options,
        selectedOption: this.state.selectedOption ? value : null
      });
    });
  }

  renderInput() {
    const { buttonText } = this.props;

    if (this.state.adding) {
      const onPress = e => {
        if (e.key === 'Enter') {
          return this.handleSave();
        }
      };

      return (
        <React.Fragment>
          <FormGroup>
            <FormControl
              id="removableSelect-value"
              autoFocus={true}
              onKeyPress={onPress}
            />
          </FormGroup>
          <Button
            type="success"
            icon="cancel-1"
            btnStyle="simple"
            size="small"
            onClick={this.handleCancelAdding}
          >
            Cancel
          </Button>
          <Button
            type="success"
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
  }

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
