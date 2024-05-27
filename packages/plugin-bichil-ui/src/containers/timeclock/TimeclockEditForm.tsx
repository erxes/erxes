import { ITimeclock, TimeclockMutationResponse } from '../../types';
import { Alert, withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import { mutations } from '../../graphql';
import TimeclockEditForm from '../../components/timeclock/TimeclockEditForm';
import React from 'react';

type Props = {
  timeclock: ITimeclock;

  contentProps: any;
};

type FinalProps = Props & TimeclockMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { timeclockEditMutation } = props;

  const timeclockEdit = values => {
    timeclockEditMutation({ variables: values })
      .then(() => Alert.success('Successfully edited time clock'))
      .catch(err => Alert.error(err.message));
  };

  const updatedProps = {
    ...props,
    timeclockEdit
  };

  return <TimeclockEditForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TimeClockMutationResponse>(gql(mutations.timeclockEdit), {
      name: 'timeclockEditMutation',
      options: {
        refetchQueries: ['timeclocksMain']
      }
    })
  )(ListContainer)
);
