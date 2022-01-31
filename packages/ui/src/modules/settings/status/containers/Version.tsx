import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import Version from '../components/Version';
import { queries } from '../graphql';

type Props = {
  kind: 'notify' | 'plain';
  showNotify?: boolean;
};

type FinalProps = {
  versionQuery;
} & Props;

const VersionContainer = (props: FinalProps) => {
  const { versionQuery, kind, showNotify } = props;
  const info = versionQuery.configsGetVersion || {};

  if (versionQuery.loading) {
    return null;
  }

  return <Version showNotify={showNotify} kind={kind} info={info} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.configsGetVersion), {
      name: 'versionQuery'
    })
  )(VersionContainer)
);
