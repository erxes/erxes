import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import ReleaseInfo from '../components/ReleaseInfo';
import { queries } from '../graphql';

type Props = {
  versionQuery;
};

const ReleaseContainer = (props: Props) => {
  const { versionQuery } = props;
  const info = versionQuery.configsGetVersion || {};

  return <ReleaseInfo info={info} />;
};

export default withProps<{}>(
  compose(
    graphql<{}, {}>(gql(queries.configsGetVersion), {
      name: 'versionQuery',
      options: {
        variables: {
          releaseNotes: true
        }
      }
    })
  )(ReleaseContainer)
);
