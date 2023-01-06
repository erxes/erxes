import EditorCK from '@erxes/ui/src/containers/EditorCK';
import { IEditorProps } from '@erxes/ui/src/types';
import React from 'react';

type Props = {} & IEditorProps;

const EditorContainer = (props: Props) => {
  return <EditorCK {...props} insertItems={[]} />;
};

export default EditorContainer;
