import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import Version from '../components/Version';
import { queries } from '../graphql';

type Props = {
  versionQuery;
};

const VersionContainer = (props: Props) => {
  const { versionQuery } = props;
  const info = versionQuery.configsGetVersion || {};

  return <Version info={info} />;
};

export default withProps<{}>(
  compose(
    graphql<{}, {}>(gql(queries.configsGetVersion), {
      name: 'versionQuery'
    })
  )(VersionContainer)
);
