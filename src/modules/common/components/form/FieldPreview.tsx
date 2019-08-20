import { SelectInput } from 'modules/settings/properties/styles';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import Icon from '../Icon';
import FormControl from './Control';
import FormGroup from './Group';
import ControlLabel from './Label';
import { ShowPreview } from './styles';

type Props = {
  type: { value: string; children: string };
  editingField?: IField;
};

type State = {
  chosenFieldType?: string;
};

class FieldPreview extends React.Component<Props, State> {
  renderSelect(options: string[] = [], attrs = {}) {
    return (
      <FormControl componentClass="select" {...attrs}>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </FormControl>
    );
  }

  renderInput() {
    return <FormControl />;
  }

  renderTextarea() {
    return <FormControl componentClass="textarea" />;
  }

  renderRadioOrCheckInputs() {
    return (
      <div>
        {/* {this.props.editingField.options.map((option, index) => (
          <SelectInput key={index}>
            {this.renderInput({ ...attrs, option })}
            <span>{option}</span>
          </SelectInput>
        ))} */}
      </div>
    );
  }

  renderControl() {
    const { type } = this.props;

    switch (type.value) {
      case 'select':
        return this.renderSelect();

      case 'check':
        return this.renderRadioOrCheckInputs();

      case 'radio':
        return this.renderRadioOrCheckInputs();

      case 'textarea':
        return this.renderTextarea();

      default:
        return this.renderInput();
    }
  }

  render() {
    const { editingField } = this.props;

    return (
      <FormGroup>
        <ControlLabel
          ignoreTrans={true}
          required={editingField && editingField.isRequired}
        >
          {editingField && editingField.text
            ? editingField.text
            : 'Field label preview'}
        </ControlLabel>

        <p>
          {editingField && editingField.description
            ? editingField.description
            : 'Field`s description preview'}
        </p>

        {this.renderControl()}

        <ShowPreview>
          <Icon icon="eye" /> Show field preview
        </ShowPreview>
      </FormGroup>
    );
  }
}

export default FieldPreview;
