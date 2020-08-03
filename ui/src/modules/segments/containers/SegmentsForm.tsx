import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { FieldsCombinedByTypeQueryResponse } from '../../settings/properties/types';
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

type Props = {
  contentType: string;
  history: any;
  id?: string;
};

type FinalProps = {
  segmentDetailQuery: SegmentDetailQueryResponse;
  headSegmentsQuery: HeadSegmentsQueryResponse;
  eventsQuery: EventsQueryResponse;
  combinedFieldsQuery: FieldsCombinedByTypeQueryResponse;
} & Props &
  AddMutationResponse &
  EditMutationResponse;

class SegmentsFormContainer extends React.Component<
  FinalProps,
  { loading: boolean; count: number }
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      count: 0
    };
  }

  componentWillMount() {
    const { headSegmentsQuery } = this.props;

    headSegmentsQuery.refetch();
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

  previewCount = (conditions: ISegmentCondition[], subOf?: string) => {
    const { contentType } = this.props;

    this.setState({ loading: true });

    client
      .query({
        query: gql(queries.segmentsPreviewCount),
        variables: {
          contentType,
          conditions,
          subOf
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
      eventsQuery,
      combinedFieldsQuery
    } = this.props;

    if (segmentDetailQuery.loading || combinedFieldsQuery.loading) {
      return null;
    }

    const events = eventsQuery.segmentsEvents || [];
    const fields = combinedFieldsQuery.fieldsCombinedByContentType || [];

    const segment = segmentDetailQuery.segmentDetail;
    const headSegments = headSegmentsQuery.segmentsGetHeads || [];

    const updatedProps = {
      ...this.props,
      fields,
      segment,
      headSegments: headSegments.filter(s => s.contentType === contentType),
      events,
      renderButton: this.renderButton,
      previewCount: this.previewCount,
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
    graphql<Props>(gql(queries.combinedFields), {
      name: 'combinedFieldsQuery',
      options: ({ contentType }) => ({
        variables: {
          contentType: contentType === 'lead' ? 'customer' : contentType
        }
      })
    })
  )(SegmentsFormContainer)
);
