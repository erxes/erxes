import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ReEnrollment from 'modules/automations/components/forms/triggers/ReEnrollment';
import { ITrigger } from 'modules/automations/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/segments/graphql';
import { SegmentDetailQueryResponse } from 'modules/segments/types';
import React from 'react';
import { graphql } from 'react-apollo';

type Props = {
  trigger: ITrigger;
  closeModal?: () => void;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
  history?: any;
};

type FinalProps = {
  segmentDetailQuery: SegmentDetailQueryResponse;
} & Props;

class ReEnrollmentContainer extends React.Component<
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
    object
  }: IButtonMutateProps) => {
    const { closeModal } = this.props;

    return (
      <ButtonMutate
        mutation={''}
        variables={values}
        callback={closeModal}
        isSubmitted={isSubmitted}
        icon="check-circle"
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  render() {
    const { segmentDetailQuery, trigger } = this.props;

    if (segmentDetailQuery.loading) {
      return null;
    }

    const segment = segmentDetailQuery.segmentDetail;

    const extendedProps = {
      ...this.props,
      segment,
      trigger,
      addConfig: this.props.addConfig
    };

    return <ReEnrollment {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, SegmentDetailQueryResponse, { _id?: string }>(
      gql(queries.segmentDetail),
      {
        name: 'segmentDetailQuery',
        options: ({ trigger }) => ({
          variables: { _id: trigger.config ? trigger.config.contentId : '' }
        })
      }
    )
  )(ReEnrollmentContainer)
);
