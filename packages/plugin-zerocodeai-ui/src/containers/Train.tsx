import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import { mutations } from '../graphql';

import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import DumpTrain from '../components/Train';

type Props = {
  trainMutation;
};

const Train = (props: Props) => {
  const { trainMutation } = props;

  const save = variables => {
    trainMutation({ variables })
      .then(() => {
        Alert.success('Successfully saved');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    save
  };

  return <DumpTrain {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.train), {
      name: 'trainMutation'
    })
  )(Train)
);
