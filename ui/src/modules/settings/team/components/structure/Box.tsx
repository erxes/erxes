import React, { useState } from 'react';

import { IStructure } from '../../types';
import View from './View';
import Form from '../../containers/structure/Form';

type Props = {
  structure: IStructure;
  refetch: () => Promise<any>;
};

export default function DumpBox({ structure, refetch }: Props) {
  const [showView, setShowView] = useState(Boolean(structure));

  if (showView) {
    return <View structure={structure} showEdit={() => setShowView(false)} />;
  }

  return (
    <Form
      refetch={refetch}
      structure={structure}
      showView={() => setShowView(true)}
    />
  );
}
