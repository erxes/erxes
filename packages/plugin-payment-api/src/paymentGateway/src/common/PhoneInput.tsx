import React from 'react';

const InputWithSendButton = ({ value, onChange, onSend }) => {
  return (
    <div className="phone-input">
      <input
        type="text"
        placeholder="Enter your phone number"
        value={value}
        onChange={onChange}
        maxLength={8}
      />
      <button onClick={onSend}>Send</button>
    </div>
  );
};

export default InputWithSendButton;
