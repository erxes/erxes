import React from 'react';
import { Formgroup } from './styles';

function FormGroup({ children }: { children: React.ReactNode }) {
  return <Formgroup>{children}</Formgroup>;
}

export default FormGroup;
