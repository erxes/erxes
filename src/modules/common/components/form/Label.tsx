import { __ } from "modules/common/utils";
import * as React from "react";
import { Label } from "./styles";

type Props = {
  children: React.ReactNode | string;
  ignoreTrans?: boolean;
  htmlFor?: string;
};

function ControlLabel(props: Props) {
  const { children, ignoreTrans } = props;

  let content = children;

  if (!ignoreTrans && typeof children === "string") {
    content = __(children);
  }

  return <Label>{content}</Label>;
}

export default ControlLabel;
