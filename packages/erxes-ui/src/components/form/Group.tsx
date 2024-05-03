import { Formgroup } from "./styles";
import React from "react";

function FormGroup({
  children,
  horizontal,
}: {
  children: React.ReactNode;
  horizontal?: boolean;
}) {
  return <Formgroup $horizontal={horizontal}>{children}</Formgroup>;
}

export default FormGroup;
