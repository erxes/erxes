import { Label } from "./styles";
import React from "react";
import { __ } from "../../utils/core";

type Props = {
  children: React.ReactNode | string;
  ignoreTrans?: boolean;
  htmlFor?: string;
  required?: boolean;
  uppercase?: boolean;
};

function ControlLabel(props: Props) {
  const { children, ignoreTrans, required, uppercase = true } = props;

  let content = children;

  if (!ignoreTrans && typeof children === "string") {
    content = __(children);
  }

  return (
    <Label $uppercase={uppercase}>
      {content}
      {required && <span> *</span>}
    </Label>
  );
}

export default ControlLabel;
