import * as compose from 'lodash.flowright';

import EditorCK from '@erxes/ui/src/containers/EditorCK';
import { IEditorProps } from '@erxes/ui/src/types';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {} & IEditorProps;

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
    label: 'Attributes'
  };

  return <EditorCK {...props} insertItems={insertItems} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.editorAttributes), {
      name: 'attributesQuery',
      options: () => {
        return {
          variables: {
            contentType: 'cards'
          }
        };
      }
    })
  )(EditorContainer)
);
