import * as compose from 'lodash.flowright';

import { IEditorProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';
import { RichTextEditor } from '@erxes/ui/src/components/richTextEditor/TEditor';

type Props = {
  contentType: string;
} & IEditorProps;

type FinalProps = {
  attributesQuery;
} & Props;

const EditorContainer = (props: FinalProps) => {
  const { attributesQuery } = props;

  if (attributesQuery.loading) {
    return null;
  }

  const items = attributesQuery.documentsGetEditorAttributes || [];

  const insertItems = {
    items,
    title: 'Attributes',
    label: 'Attributes',
  };

  return <RichTextEditor {...props} placeholderProp={insertItems} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.editorAttributes), {
      name: 'attributesQuery',
      options: ({ contentType }) => {
        return {
          variables: {
            contentType,
          },
        };
      },
    }),
  )(EditorContainer),
);
