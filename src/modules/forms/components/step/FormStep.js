import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormControl, Button, Icon } from 'modules/common/components';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import { dimensions, colors } from 'modules/common/styles';
import { FlexItem, LeftItem, Preview, Title } from './style';

const Fields = styled.ul`
  list-style: none;
  padding: 0;

  button {
    color: ${colors.colorSecondary};
    font-weight: 500;
  }
`;

const Actions = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
`;

const FieldItem = styled.li`
  padding: 6px 20px;
  position: relative;
  margin-bottom: ${dimensions.unitSpacing - 4}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  display: flex;
  justify-content: space-between;
  transition: all 0.3s ease;

  i {
    display: none;
    cursor: pointer;
  }

  &:hover {
    i {
      display: inline-block;
    }
  }
`;

const propTypes = {
  kind: PropTypes.string,
  title: PropTypes.string,
  btnText: PropTypes.string,
  bodyValue: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
  options: PropTypes.array,
  changeState: PropTypes.func
};

class FormStep extends Component {
  constructor(props) {
    super(props);

    this.state = {
      add: false,
      options: ['email']
    };

    this.handleOption = this.handleOption.bind(this);
    this.renderNewField = this.renderNewField.bind(this);
    this.handleSaveOption = this.handleSaveOption.bind(this);
    this.renderOptions = this.renderOptions.bind(this);
    this.handleCancelAddingOption = this.handleCancelAddingOption.bind(this);
  }

  handleCancelAddingOption() {
    this.setState({ add: false });
  }

  handleOption() {
    this.setState({ add: !this.state.add });
  }

  handleRemoveOption(index) {
    const { options } = this.state;

    this.setState({
      options: options.splice(index, 1) && options
    });
    this.props.changeState('options', options);
  }

  handleSaveOption() {
    const { options } = this.state;
    const optionValue = document.getElementById('optionValue').value;

    this.setState({ options: [...options, optionValue] }, () => {
      this.props.changeState('options', this.state.options);
    });
  }

  renderNewField() {
    if (this.state.add) {
      return (
        <div>
          <FormControl
            componentClass="select"
            placeholder="Select a Field"
            defaultValue=""
            onChange={this.handleSaveOption}
            id="optionValue"
          >
            <option />
            <option>FirstName</option>
            <option>LastName</option>
            <option>Phone</option>
          </FormControl>
          <Actions>
            <Button
              type="success"
              btnStyle="simple"
              size="small"
              onClick={this.handleOption}
            >
              Cancel
            </Button>
          </Actions>
        </div>
      );
    }

    return (
      <Button
        onClick={this.handleOption}
        btnStyle="link"
        size="small"
        icon="plus"
      >
        Add another form field
      </Button>
    );
  }

  renderPreview() {
    const {
      title,
      bodyValue,
      btnText,
      color,
      theme,
      image,
      options,
      kind
    } = this.props;

    if (kind === 'shoutbox') {
      return (
        <ShoutboxPreview
          title={title}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
          options={options}
        />
      );
    } else if (kind === 'popup') {
      return (
        <PopupPreview
          title={title}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
          options={options}
        />
      );
    }
    return (
      <EmbeddedPreview
        title={title}
        bodyValue={bodyValue}
        btnText={btnText}
        color={color}
        theme={theme}
        image={image}
        options={options}
      />
    );
  }

  renderOption(option, index) {
    return (
      <FieldItem key={index}>
        {option}
        <Icon icon="close" onClick={() => this.handleRemoveOption(index)} />
      </FieldItem>
    );
  }

  renderOptions() {
    return (
      <Fields>
        {this.state.options.map((option, index) =>
          this.renderOption(option, index)
        )}
        {this.renderNewField()}
      </Fields>
    );
  }

  render() {
    const { __ } = this.context;

    return (
      <FlexItem>
        <LeftItem>
          <Title>{__('Included fields')}</Title>
          {this.renderOptions()}
        </LeftItem>
        <Preview>{this.renderPreview()}</Preview>
      </FlexItem>
    );
  }
}

FormStep.propTypes = propTypes;
FormStep.contextTypes = {
  __: PropTypes.func
};

export default FormStep;
