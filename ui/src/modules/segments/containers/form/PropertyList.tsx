import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';

import { queries as boardQueries } from 'modules/boards/graphql';
import { BoardsQueryResponse } from 'modules/boards/types';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries as formQueries } from 'modules/forms/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import PropertyList from '../../components/form/PropertyList';

import {
  AddMutationResponse,
  EditMutationResponse,
  ISegmentCondition,
  ISegmentMap
} from '../../types';
import { isBoardKind } from '../../utils';

type Props = {
  segment: ISegmentMap;
  contentType: string;
  addCondition: (condition: ISegmentCondition, segmentKey: string) => void;
  onClickBackToList: () => void;
  hideBackButton: boolean;
  changeSubSegmentConjunction: (
    segmentKey: string,
    conjunction: string
  ) => void;
};

type FinalProps = {
  boardsQuery?: BoardsQueryResponse;
} & Props &
  AddMutationResponse &
  EditMutationResponse;

class PropertyListContainer extends React.Component<
  FinalProps,
  { fields: any[]; searchValue: string; loading: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      fields: [],
      searchValue: '',
      loading: false
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
            : propertyType
        }
      })
      .then(({ data, loading }) => {
        this.setState({
          fields: data.fieldsCombinedByContentType,
          loading
        });
      });
  };

  onSearch = (value: string) => {
    this.setState({ searchValue: value });
  };

  render() {
    const { boardsQuery } = this.props;
    const { fields, searchValue, loading } = this.state;

    if (boardsQuery && boardsQuery.loading) {
      return null;
    }

    if (loading) {
      return <Spinner />;
    }

    const boards = boardsQuery ? boardsQuery.boards || [] : [];

    const condition = new RegExp(searchValue, 'i');

    const results = fields.filter(field => {
      return condition.test(field.label);
    });

    const cleanFields = results.map(item => ({
      value: item.name || item._id,
      label: item.label || item.title,
      type: (item.type || '').toLowerCase(),
      group: item.group || '',
      selectOptions: item.selectOptions || [],
      // radio button options
      choiceOptions: item.options || []
    }));

    const updatedProps = {
      ...this.props,
      boards,
      fetchFields: this.fetchFields,
      onSearch: this.onSearch,
      fields: cleanFields
    };

    return <PropertyList {...updatedProps} />;
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
  )(PropertyListContainer)
);
