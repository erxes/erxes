import * as React from "react";
import { __ } from "../../utils";

type Props = {
  text: React.ReactNode;
  onClickHandler: () => void;
};

function BackButton({ onClickHandler, text }: Props) {
  return (
    <button onClick={onClickHandler} className="back">
      <i className="icon-leftarrow-2" />
      {text}
    </button>
  );
}

export default BackButton;
