import * as React from 'react';

type Props = {
  onClickHandler: () => void;
};

function BackButton({ onClickHandler }: Props) {
  return (
    <div className="back-button">
      <button type="button" className="erxes-button" onClick={onClickHandler}>
        Back
      </button>
    </div>
  );
}

export default BackButton;
