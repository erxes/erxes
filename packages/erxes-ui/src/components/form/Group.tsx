import { Formgroup } from "./styles";
import React from "react";

function FormGroup({
  children,
  horizontal,
  className,
  controlId,
}: {
  children: React.ReactNode;
  horizontal?: boolean;
  className?: string;
  controlId?: string;
}) {
  return (
    <Formgroup
      controlId={controlId}
      className={className}
      $horizontal={horizontal}
    >
      {children}
    </Formgroup>
  );
}

export default FormGroup;
