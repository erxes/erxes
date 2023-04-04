import React from 'react';

import Select from 'react-select-plus';
import FormControl from '../../common/form/Control';
import FormGroup from '../../common/form/Group';
import { IAttachment, IField } from '../../types';
import { ControlLabel } from '../../common/form';
import { SelectInput } from '../../styles/tickets';
import Uploader from '../../common/Uploader';
import ModifiableList from '../../common/form/ModifiableList';
import { __ } from '../../../utils';

type Props = {
  field: IField;
};

type State = {
  value?: any;
  checkBoxValues: any[];
  errorCounter: number;
};

export default class GenerateField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  renderInput(attrs, hasError?: boolean) {
    const { type } = this.props.field;

    attrs.type = 'text';

    if (type === 'radio') {
      attrs.type = 'radio';
      attrs.componentClass = 'radio';
      //   attrs.checked = String(value) === attrs.option;
    }

    if (type === 'check') {
      attrs.type = 'checkbox';
      attrs.componentClass = 'checkbox';
      //   attrs.checked = checkBoxValues.includes(attrs.option);
    }

    return <FormControl {...attrs} />;
  }

  renderTextarea(attrs) {
    return <FormControl componentClass="textarea" {...attrs} />;
  }

  renderSelect(options: string[] = [], attrs = {}) {
    return (
      <FormControl componentClass="select" {...attrs}>
        <option key={''} value="">
          Choose option
        </option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </FormControl>
    );
  }

  renderMultiSelect(options: string[] = [], attrs) {
    return (
      <Select
        options={options.map((e) => ({ value: e, label: e }))}
        multi={true}
      />
    );
  }

  renderRadioOrCheckInputs(options, attrs, hasError?: boolean) {
    return (
      <div>
        {options.map((option, index) => (
          <SelectInput key={index}>
            {this.renderInput({ ...attrs, option }, hasError)}
            <span>{option}</span>
          </SelectInput>
        ))}
      </div>
    );
  }

  renderList(attrs) {
    let options = [];
    if (attrs.value && attrs.value.length > 0) {
      options = attrs.value.split(',') || [];
    }

    const onChange = (ops) => {
      const { field } = this.props;
    };

    return (
      <ModifiableList
        options={options}
        onChangeOption={onChange}
        addButtonLabel={__('Add a value')}
        showAddButton={true}
      />
    );
  }

  renderFile({ id, value }) {
    const onChangeFile = (attachments: IAttachment[]) => {
      //   const { onValueChange } = this.props;
      //   if (onValueChange) {
      //     this.setState({ value: attachments });
      //     onValueChange({ _id: id, value: attachments });
      //   }
    };

    return (
      <Uploader
        defaultFileList={value || []}
        // onChange={onChangeFile}
        multiple={true}
        single={false}
      />
    );
  }

  renderControl() {
    const { field } = this.props;
    const { type, options } = field;

    const attrs = {
      id: field._id,
      name: ''
    };

    switch (type) {
      case 'select':
        return this.renderSelect(options, attrs);

      case 'multiSelect':
        return this.renderMultiSelect(options, attrs);

      case 'textarea':
        return this.renderTextarea(attrs);

      case 'check':
        try {
          return this.renderRadioOrCheckInputs(options, attrs);
        } catch {
          return this.renderRadioOrCheckInputs(options, attrs, true);
        }

      case 'radio':
        attrs.name = Math.random().toString();
        try {
          return this.renderRadioOrCheckInputs(options, attrs);
        } catch {
          return this.renderRadioOrCheckInputs(options, attrs, true);
        }

      case 'list': {
        return this.renderList(attrs);
      }

      //   case 'objectList': {
      //     return this.renderObjectList(objectListConfigs, attrs);
      //   }

      case 'file': {
        return this.renderFile(attrs);
      }

      default:
        return this.renderInput(attrs, true);
    }
  }

  render() {
    const { field } = this.props;

    return (
      <FormGroup>
        <ControlLabel ignoreTrans={true} required={field.isRequired}>
          {field.text}
        </ControlLabel>

        {this.renderControl()}
      </FormGroup>
    );
  }
}
