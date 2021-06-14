import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries as boardQueries } from 'modules/boards/graphql';
import { BoardsQueryResponse } from 'modules/boards/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { queries as formQueries } from 'modules/forms/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import SegmentsForm from '../components/SegmentsForm';
import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  EditMutationResponse,
  EventsQueryResponse,
  HeadSegmentsQueryResponse,
  ISegmentCondition,
  SegmentDetailQueryResponse
} from '../types';
import { isBoardKind } from '../utils';

type Props = {
  contentType: string;
  history: any;
  id?: string;
};

type FinalProps = {
  segmentDetailQuery: SegmentDetailQueryResponse;
  headSegmentsQuery: HeadSegmentsQueryResponse;
  eventsQuery: EventsQueryResponse;
  boardsQuery?: BoardsQueryResponse;
} & Props &
  AddMutationResponse &
  EditMutationResponse;

class SegmentsFormContainer extends React.Component<
  FinalProps,
  { loading: boolean; count: number; fields: any[] }
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      count: 0,
      fields: []
    };
  }

  componentWillMount() {
    const { headSegmentsQuery } = this.props;

    headSegmentsQuery.refetch();

    this.fetchFields();
  }

  renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const { contentType, history } = this.props;

    const callBackResponse = () => {
      history.push(`/segments/${contentType}`);

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.segmentsEdit : mutations.segmentsAdd}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        uppercase={false}
        icon="check-circle"
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  fetchFields = (pipelineId?: string) => {
    const { id, contentType } = this.props;

    client
      .query({
        query: gql(formQueries.fieldsCombinedByContentType),
        variables: {
          segmentId: id,
          pipelineId,
          contentType: ['visitor', 'lead', 'customer'].includes(contentType)
            ? 'customer'
            : contentType
        }
      })
      .then(({ data }) => {
        this.setState({
          fields: data.fieldsCombinedByContentType
        });
      });
  };

  previewCount = ({
    conditions,
    subOf,
    boardId,
    pipelineId
  }: {
    conditions: ISegmentCondition[];
    subOf?: string;
    boardId?: string;
    pipelineId?: string;
  }) => {
    const { contentType } = this.props;

    this.setState({ loading: true });

    client
      .query({
        query: gql(queries.segmentsPreviewCount),
        variables: {
          contentType,
          conditions,
          subOf,
          boardId,
          pipelineId
        }
      })
      .then(({ data }) => {
        this.setState({
          count: data.segmentsPreviewCount,
          loading: false
        });
      });
  };

  render() {
    const {
      contentType,
      segmentDetailQuery,
      headSegmentsQuery,
      boardsQuery,
      eventsQuery
    } = this.props;

    if (segmentDetailQuery.loading) {
      return null;
    }

    const events = eventsQuery.segmentsEvents || [];
    const boards = boardsQuery ? boardsQuery.boards || [] : [];

    const segment = segmentDetailQuery.segmentDetail;
    const headSegments = headSegmentsQuery.segmentsGetHeads || [];

    const updatedProps = {
      ...this.props,
      segment,
      boards,
      headSegments: headSegments.filter(s =>
        s.contentType === contentType && segment ? s._id !== segment._id : true
      ),
      events,
      renderButton: this.renderButton,
      previewCount: this.previewCount,
      fetchFields: this.fetchFields,
      fields: this.state.fields,
      count: this.state.count,
      counterLoading: this.state.loading
    };

    return <SegmentsForm {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, SegmentDetailQueryResponse, { _id?: string }>(
      gql(queries.segmentDetail),
      {
        name: 'segmentDetailQuery',
        options: ({ id }) => ({
          variables: { _id: id }
        })
      }
    ),
    graphql<Props, HeadSegmentsQueryResponse, { contentType: string }>(
      gql(queries.headSegments),
      {
        name: 'headSegmentsQuery'
      }
    ),
    graphql<Props>(gql(queries.events), {
      name: 'eventsQuery',
      options: ({ contentType }) => ({
        variables: { contentType }
      })
    }),
    graphql<Props>(gql(boardQueries.boards), {
      name: 'boardsQuery',
      options: ({ contentType }) => ({
        variables: { type: contentType }
      }),
      skip: ({ contentType }) => !isBoardKind(contentType)
    })
  )(SegmentsFormContainer)
);
