import React, { useState } from 'react';

import { IStructure } from '@erxes/ui-team/src/types';
import View from './View';

type Props = {
  structure: IStructure;
  refetch: () => Promise<any>;
};

export default function DumpBox({ structure, refetch }: Props) {
  const [showView, setShowView] = useState(Boolean(structure));

    return <View structure={structure} showEdit={() => setShowView(false)}refetch={refetch} />;
}
