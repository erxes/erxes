import * as React from 'react';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi';
type Props = {
  text: string;
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
      {type === 'back' && <HiArrowLeft width="1,2em" strokeWidth="1.2px" />}
      <div style={{ padding: '5px' }}>{`${text}`} </div>
      {type === 'next' && <HiArrowRight width="1,2em" strokeWidth="1.2px" />}
    </button>
  );
}

export default Button;
