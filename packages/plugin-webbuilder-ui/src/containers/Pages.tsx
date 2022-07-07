import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import Pages from '../components/Pages';
import { queries } from '../graphql';
import React from 'react';

type Props = {
  pagesQuery: any;
};

class PagesContainer extends React.Component<Props> {
  render() {
    const pages = this.props.pagesQuery.webbuilderPages || [];

    return <Pages pages={pages} />;
  }
}

export default compose(
  graphql(gql(queries.pages), {
    name: 'pagesQuery'
  })
)(PagesContainer);
