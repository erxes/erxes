import { IField } from 'modules/settings/properties/types';
import React from 'react';
import Icon from '../Icon';
import ModalTrigger from '../ModalTrigger';
import FormField from './FormField';
import { Field, Options } from './styles';

type Props = {
  children?: any[];
  editingField?: IField;
  onChange: (value: IField, callback: () => void) => void;
  onSubmit: (e: any) => void;
};

class FormFields extends React.Component<Props> {
  renderIcon(value: string) {
    let icon;
    switch (value) {
      case 'input':
        icon = 'edit';
        break;
      case 'textarea':
        icon = 'alignleft';
        break;
      case 'select':
        icon = 'clicker';
        break;
      case 'check':
        icon = 'check';
        break;
      case 'radio':
        icon = 'checked-1';
        break;
      case 'phone':
        icon = 'phonecall-3';
        break;
      case 'email':
        icon = 'email-1';
        break;
      case 'firstName':
        icon = 'user-3';
        break;
      default:
        icon = 'user-4';
    }

    return <Icon icon={icon} size={25} />;
  }

  renderContent(option) {
    const { onSubmit, onChange, editingField } = this.props;

    const trigger = (
      <Field isGreyBg={true}>
        {this.renderIcon(option.value)}
        <span>{option.children}</span>
      </Field>
    );

    const content = props => (
      <FormField
        {...props}
        type={option}
        onSubmit={onSubmit}
        onChange={onChange}
        editingField={editingField}
      />
    );

    return (
      <ModalTrigger
        title={`Add ${option.children} field`}
        size="lg"
        trigger={trigger}
        content={content}
      />
    );
  }

  render() {
    const { children } = this.props;

    if (!children) {
      return null;
    }

    return (
      <Options>
        {children.map((option, index) => (
          <div key={index}>{this.renderContent(option.props)}</div>
        ))}
      </Options>
    );
  }
}

export default FormFields;
