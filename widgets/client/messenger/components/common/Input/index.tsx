import * as React from 'react';
import { __ } from '../../../../utils';

type Props = {
  id?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  value?: string;
  placeholder?: string;
  label?: string;
  textArea?: boolean;
  rows?: number;
};
const Input: React.FC<Props> = ({
  id,
  onChange,
  value,
  placeholder,
  label,
  textArea = false,
  rows = 2,
}) => {
  const renderInputElement = () => {
    const elementProps = { id, value, onChange, placeholder, rows };
    if (textArea) {
      return <textarea {...elementProps} />;
    }
    return <input {...elementProps} />;
  };
  return (
    <div className="input-container">
      {label && <label htmlFor={id}>{__(label)}</label>}
      {renderInputElement()}
    </div>
  );
};

export default Input;
