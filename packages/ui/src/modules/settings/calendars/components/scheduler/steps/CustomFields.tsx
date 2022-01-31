import Button from 'modules/common/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import { additionalField } from '../../../types';

const WebsiteItem = styled.div`
  padding: 12px 16px 0 16px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #eee;
  position: relative;
`;

const RemoveButton = styled.div`
  position: absolute;
  right: 16px;
  top: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity ease 0.3s;

  &:hover {
    opacity: 0.8;
    cursor: pointer;
  }
`;

const RequiredField = styled.div`
  padding: 12px 12px 12px 0;
  border-bottom: 1px solid #eee;
  position: relative;
  span {
    float: right;
  }
`;

type Props = {
  onChange: (name: 'additionalFields', value: any) => void;
  additionalFields?: additionalField[];
};

type State = {
  additionalFields: additionalField[];
};

const emptyField = { label: '', name: '', type: 'text', required: false };

class CustomFields extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      additionalFields: [emptyField]
    };
  }

  updateFieldValues = () => {
    this.props.onChange('additionalFields', this.state.additionalFields);
  };

  onChangeInput = (
    i: number,
    type: 'label' | 'type' | 'required',
    e: React.FormEvent
  ) => {
    const element = e.target as HTMLInputElement;
    const value = type === 'required' ? element.checked : element.value;

    const entries = [...this.state.additionalFields];

    entries[i] = { ...entries[i], [type]: value };

    if (type === 'label') {
      entries[i] = { ...entries[i], name: element.value };
    }

    this.setState({ additionalFields: entries }, () =>
      this.updateFieldValues()
    );
  };

  handleRemoveWebsite = (i: number) => {
    this.setState(
      {
        additionalFields: this.state.additionalFields.filter(
          (item, index) => index !== i
        )
      },
      () => this.updateFieldValues()
    );
  };

  renderRemoveInput = (i: number) => {
    return (
      <Tip text={__('Remove')} placement="top">
        <RemoveButton onClick={this.handleRemoveWebsite.bind(null, i)}>
          <Icon icon="times" />
        </RemoveButton>
      </Tip>
    );
  };

  onAddMoreInput = () => {
    this.setState({
      additionalFields: [...this.state.additionalFields, emptyField]
    });
  };

  renderRequiredField = (name: string) => {
    return (
      <RequiredField>
        <span>
          (required)
          <Icon icon="lock" />
        </span>
        {name}
      </RequiredField>
    );
  };

  render() {
    const { additionalFields } = this.state;

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>What info should guests provide?</ControlLabel>
            {this.renderRequiredField('Name')}
            {this.renderRequiredField('Email')}
          </FormGroup>

          {additionalFields.map((field, index) => (
            <FormGroup key={index}>
              <WebsiteItem>
                <FormGroup>
                  <ControlLabel required={true}>Label</ControlLabel>
                  <FormControl
                    name="label"
                    onChange={this.onChangeInput.bind(null, index, 'label')}
                    required={true}
                    value={field.label}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel required={true}>Type</ControlLabel>

                  <FormControl
                    value={field.type}
                    name="type"
                    onChange={this.onChangeInput.bind(null, index, 'type')}
                    componentClass="select"
                  >
                    <option value="text">text</option>
                    <option value="multi-line text">multi-line text</option>
                    <option value="email">email</option>
                    <option value="phone">phone</option>
                    <option value="number">number</option>
                    <option value="dropdown">dropdown</option>
                    <option value="checkbox">checkbox</option>
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Required</ControlLabel>
                  <FormControl
                    name="required"
                    defaultChecked={field.required}
                    componentClass="checkbox"
                    onChange={this.onChangeInput.bind(null, index, 'required')}
                  />
                </FormGroup>
              </WebsiteItem>
              {this.renderRemoveInput(index)}
            </FormGroup>
          ))}
          <Button
            onClick={this.onAddMoreInput}
            icon="plus-circle"
            btnStyle="primary"
          >
            Add a field
          </Button>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default CustomFields;
