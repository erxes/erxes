import * as React from 'react';

type Props = {
  type:string;
  onClickHandler: () => void;
};

function Button(type: string, { onClickHandler }: Props) {
  return (
      <button type="button" className={`${type}`} onClick={onClickHandler}>
        {`${type}`}
      </button>
  );
}

export default Button;
