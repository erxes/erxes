import * as React from 'react';

type Props = {
  text: string;
  onClickHandler: () => void;
  color?: string;
  style?: {};
};

function Button({ color, text, onClickHandler, style }: Props) {
  return (
    <button
      type="button"
      className={`btn bg-${color}`}
      onClick={onClickHandler}
      style={style}
    >
      {`${text}`}
    </button>
  );
}

export default Button;
