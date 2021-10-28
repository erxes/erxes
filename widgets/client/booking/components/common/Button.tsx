import * as React from 'react';

type Props = {
  text: any;
  onClickHandler: () => void;
  color?: string;
  style?: {};
  type: string;
};

function Button({ text, type, onClickHandler, style }: Props) {
  return (
    <button
      type="button"
      className={`btn`}
      onClick={onClickHandler}
      style={style}
    >
      <div style={{ padding: '5px' }}>{`${text}`}</div>
    </button>
  );
}

export default Button;
