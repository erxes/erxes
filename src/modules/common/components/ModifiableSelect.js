import React, { Component, Fragment } from 'react';
import Select from 'react-select-plus';
import PropTypes from 'prop-types';
import { FormControl, Button, Icon, FormGroup } from './';

const propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  buttonText: PropTypes.string
};

const contextTypes = {
  __: PropTypes.func
};

class Option extends Component {
  render() {
    const { option, onSelect } = this.props;
    const { onRemove } = option;
    const style = {
      display: 'inline-block',
      width: '100%',
      padding: '8px 20px'
    };

    return (
      <div style={style} onClick={e => onSelect(option, e)}>
        <span style={{ float: 'left' }}>{option.label}</span>
        <Icon
          style={{ float: 'right' }}
          onClick={() => onRemove(option.value)}
          icon="cancel-1"
        />
      </div>
    );
  }
}

Option.propTypes = {
  option: PropTypes.object,
  onSelect: PropTypes.func
};

class ModifiableSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adding: false,
      options: props.options || [],
      selectedOption: props.value
    };

    this.handleSave = this.handleSave.bind(this);
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

  handleSave() {
    const { options, selectedOption } = this.state;
    const { onChange } = this.props;
    const value = document.getElementById('removableSelect-value').value;

    this.setState({ adding: false, options: [...options, value] }, () => {
      onChange({ options: this.state.options, selectedOption });
    });

    document.getElementById('removableSelect-value').value = '';
  }

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
        selectedOption: null
      },
      () => {
        onChange({ options: this.state.options, selectedOption: null });
      }
    );
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
    const { __ } = this.context;
    const { buttonText } = this.props;

    if (this.state.adding) {
      return (
        <Fragment>
          <FormGroup>
            <FormControl
              id="removableSelect-value"
              autoFocus
              onKeyPress={e => {
                if (e.key === 'Enter') this.handleSave();
              }}
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
        </Fragment>
      );
    }

    return (
      <Button onClick={this.handleAdding} size="small" icon="add">
        {__(buttonText)}
      </Button>
    );
  }

  render() {
    const { placeholder } = this.props;
    const { selectedOption } = this.state;
    const { __ } = this.context;

    return (
      <Fragment>
        <FormGroup>
          <Select
            placeholder={__(placeholder)}
            searchable={false}
            value={selectedOption}
            valueComponent={this.renderValue}
            onChange={obj => this.setItem(obj)}
            options={this.generateOptions()}
            optionComponent={Option}
          />
        </FormGroup>

        {this.renderInput()}
      </Fragment>
    );
  }
}

ModifiableSelect.contextTypes = contextTypes;
ModifiableSelect.propTypes = propTypes;

export default ModifiableSelect;
