import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { ITrigger } from '../../types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import SegmentsForm from '../../components/form/SegmentsForm';
import { mutations, queries } from '../../graphql';
import {
  AddMutationResponse,
  EditMutationResponse,
  EventsQueryResponse,
  HeadSegmentsQueryResponse,
  ISegmentCondition,
  SegmentDetailQueryResponse,
  SegmentsQueryResponse
} from '../../types';

type Props = {
  contentType: string;
  history?: any;
  id?: string;
  closeModal: () => void;
  activeTrigger?: ITrigger;
  addConfig?: (trigger: ITrigger, id?: string, config?: any) => void;
  filterContent?: (values: any) => void;
  afterSave?: () => void;
  hideDetailForm?: boolean;
};

type FinalProps = {
  segmentDetailQuery: SegmentDetailQueryResponse;
  headSegmentsQuery: HeadSegmentsQueryResponse;
  eventsQuery: EventsQueryResponse;
  segmentsQuery: SegmentsQueryResponse;
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

  renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
    text
  }: IButtonMutateProps) => {
    const {
      contentType,
      history,
      addConfig,
      activeTrigger,
      closeModal
    } = this.props;

    const callBackResponse = data => {
      if (history) {
        history.push(`/segments?contentType=${contentType}`);
      }

      if (callback) {
        callback();
      }

      if (addConfig && activeTrigger) {
        const result = values._id ? data.segmentsEdit : data.segmentsAdd;
        const trigger = { ...activeTrigger };

        trigger.count = result.count;

        addConfig(trigger, activeTrigger.id, { contentId: result._id });

        closeModal();
      }
    };

    return (
      <ButtonMutate
        mutation={values._id ? mutations.segmentsEdit : mutations.segmentsAdd}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        icon="check-circle"
        type="submit"
        successMessage={`Success`}
      >
        {text || 'Save'}
      </ButtonMutate>
    );
  };

  previewCount = ({
    conditions,
    subOf,
    config,
    conditionsConjunction
  }: {
    conditions: ISegmentCondition[];
    subOf?: string;
    config?: any;
    conditionsConjunction?: string;
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
          config,
          conditionsConjunction
        },
        fetchPolicy: 'network-only'
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
      segmentsQuery,
      history,
      filterContent
    } = this.props;

    if (segmentDetailQuery.loading) {
      return null;
    }

    const events = eventsQuery.segmentsEvents || [];

    const segment = segmentDetailQuery.segmentDetail;
    const headSegments = headSegmentsQuery.segmentsGetHeads || [];
    const segments = segmentsQuery.segments || [];
    const isModal = history ? false : true;

    const updatedProps = {
      ...this.props,
      segment,
      headSegments: headSegments.filter(s =>
        s.contentType === contentType && segment ? s._id !== segment._id : true
      ),
      segments: segments.filter(s => (segment ? s._id !== segment._id : true)),
      events,
      renderButton: this.renderButton,
      previewCount: this.previewCount,
      fields: this.state.fields,
      count: this.state.count,
      counterLoading: this.state.loading,
      isModal,
      filterContent
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
          fetchPolicy: 'network-only',
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
    graphql<Props, SegmentsQueryResponse, { contentTypes: string[] }>(
      gql(queries.segments),
      {
        name: 'segmentsQuery',
        options: ({ contentType }) => ({
          fetchPolicy: 'network-only',
          variables: { contentTypes: [contentType] }
        })
      }
    ),

    graphql<Props>(gql(queries.events), {
      name: 'eventsQuery',
      options: ({ contentType }) => ({
        variables: { contentType }
      })
    })
  )(SegmentsFormContainer)
);
