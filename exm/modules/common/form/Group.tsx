import React from 'react';
import { Formgroup } from './styles';

function FormGroup({
  children,
  horizontal,
}: {
  children: React.ReactNode;
  horizontal?: boolean;
}) {
  return <Formgroup horizontal={horizontal}>{children}</Formgroup>;
}

export default FormGroup;
