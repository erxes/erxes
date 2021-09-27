import * as React from 'react';

type Props = {
  onClickHandler: () => void;
};

function BackButton({ onClickHandler }: Props) {
  return (
    <button
      style={{ margin: '5px', backgroundColor: '#5629B6' }}
      type="button"
      className="erxes-button"
      onClick={onClickHandler}
    >
      Back
    </button>
  );
}

export default BackButton;
