import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';

import { queries as boardQueries } from 'modules/boards/graphql';
import { BoardsQueryResponse } from 'modules/boards/types';
import { withProps } from 'modules/common/utils';
import { queries as formQueries } from 'modules/forms/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import PropertyForm from '../../components/form/PropertyForm';

import { AddMutationResponse, EditMutationResponse } from '../../types';
import { isBoardKind } from '../../utils';

type Props = {
  contentType: string;
};

type FinalProps = {
  boardsQuery?: BoardsQueryResponse;
} & Props &
  AddMutationResponse &
  EditMutationResponse;

class SegmentsFormContainer extends React.Component<
  FinalProps,
  { fields: any[] }
> {
  constructor(props) {
    super(props);

    this.state = {
      fields: []
    };
  }

  componentWillMount() {
    const { contentType } = this.props;

    this.fetchFields(contentType);
  }

  fetchFields = (propertyType: string, pipelineId?: string) => {
    client
      .query({
        query: gql(formQueries.fieldsCombinedByContentType),
        variables: {
          pipelineId,
          contentType: ['visitor', 'lead', 'customer'].includes(propertyType)
            ? 'customer'
            : propertyType,
          usageType: 'segment'
        }
      })
      .then(({ data }) => {
        this.setState({
          fields: data.fieldsCombinedByContentType
        });
      });
  };

  render() {
    const { boardsQuery } = this.props;

    if (boardsQuery && boardsQuery.loading) {
      return null;
    }

    const boards = boardsQuery ? boardsQuery.boards || [] : [];

    const updatedProps = {
      ...this.props,
      boards,
      fetchFields: this.fetchFields,
      fields: this.state.fields
    };

    return <PropertyForm {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(boardQueries.boards), {
      name: 'boardsQuery',
      options: ({ contentType }) => ({
        variables: { type: contentType }
      }),
      skip: ({ contentType }) => !isBoardKind(contentType)
    })
  )(SegmentsFormContainer)
);
