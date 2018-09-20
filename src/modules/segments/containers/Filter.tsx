import gql from 'graphql-tag';
import { router } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Filter } from '../components';
import { queries } from '../graphql';

type Props = {
  segmentsQuery: any;
  history: any;
  location: any;
  match: any;
};

const FilterContainer = (props: Props) => {
  const { segmentsQuery, history } = props;

  const currentSegment = router.getParam(history, 'segment');

  const setSegment = segment => {
    router.setParams(history, { segment });
  };

  const removeSegment = () => {
    router.removeParams(history, 'segment');
  };

  const extendedProps = {
    ...props,
    currentSegment,
    setSegment,
    removeSegment,
    segments: segmentsQuery.segments || [],
    loading: segmentsQuery.loading
  };

  return <Filter {...extendedProps} />;
};

export default compose(
  graphql(gql(queries.segments), {
    name: 'segmentsQuery',
    options: ({ contentType }: { contentType: string }) => ({
      variables: { contentType }
    })
  })
)(withRouter<Props>(FilterContainer));
