import * as compose from 'lodash.flowright';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { FieldsCombinedByTypeQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ITrigger } from '../../../types';
import ReEnrollment from '../../../components/forms/triggers/ReEnrollment';
import React from 'react';
import { SegmentDetailQueryResponse } from '@erxes/ui-segments/src/types';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui-segments/src/graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  trigger: ITrigger;
  segmentId: string;
  closeModal?: () => void;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
  history?: any;
};

type FinalProps = {
  segmentDetailQuery: SegmentDetailQueryResponse;
  fieldsQuery: FieldsCombinedByTypeQueryResponse;
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
    const { segmentDetailQuery, trigger, fieldsQuery } = this.props;

    if (segmentDetailQuery.loading || fieldsQuery.loading) {
      return null;
    }

    const segment = segmentDetailQuery.segmentDetail;
    const fields = fieldsQuery.fieldsCombinedByContentType || [];

    const extendedProps = {
      ...this.props,
      segment,
      trigger,
      fields,
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
    ),
    graphql<Props>(gql(formQueries.fieldsCombinedByContentType), {
      name: 'fieldsQuery',
      options: ({ trigger, segmentId }) => ({
        variables: {
          contentType: trigger.type,
          segmentId
        }
      })
    })
  )(ReEnrollmentContainer)
);
