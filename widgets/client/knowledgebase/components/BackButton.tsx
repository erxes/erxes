import * as React from "react";
import { iconLeft } from "../../icons/Icons";
import { __ } from "../../utils";

type Props = {
  text: React.ReactNode;
  onClickHandler: () => void;
};

function BackButton({ onClickHandler, text }: Props) {
  return (
    <button onClick={onClickHandler} className="back">
      {iconLeft('#888')}
      {text}
    </button>
  );
}

export default BackButton;
