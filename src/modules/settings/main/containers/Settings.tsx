import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { Settings } from '../components';
import { queries } from '../graphql';
import { VersionsQueryResponse } from '../types';

type Props = {
  versionsQuery: VersionsQueryResponse;
};

const SettingsContainer = (props: Props) => {
  const { versionsQuery } = props;

  const updatedProps = {
    ...props,
    versions: versionsQuery.configsVersions || {}
  };

  return <Settings {...updatedProps} />;
};

export default withProps<{}>(
  compose(
    graphql<{}, VersionsQueryResponse>(gql(queries.configsVersions), {
      name: 'versionsQuery'
    })
  )(SettingsContainer)
);
