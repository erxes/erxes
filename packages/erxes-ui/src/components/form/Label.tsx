import { Label } from "./styles";
import React from "react";
import { __ } from "../../utils/core";

type Props = {
  children: React.ReactNode | string;
  ignoretrans?: boolean;
  htmlFor?: string;
  required?: boolean;
  uppercase?: boolean;
};

function ControlLabel(props: Props) {
  const { children, ignoretrans, required, uppercase = true } = props;

  let content = children;

  if (!ignoretrans && typeof children === "string") {
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
