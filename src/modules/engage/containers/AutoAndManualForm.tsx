import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { Alert, withProps } from 'modules/common/utils';
import {
  AddMutationResponse,
  AddMutationVariables
} from 'modules/segments/types';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CountQueryResponse } from '../../customers/types';
import {
  HeadSegmentsQueryResponse,
  SegmentsQueryResponse
} from '../../segments/types';
import { EmailTemplatesQueryResponse } from '../../settings/emailTemplates/containers/List';
import { FieldsCombinedByTypeQueryResponse } from '../../settings/properties/types';
import { AutoAndManualForm } from '../components';
import FormBase from '../components/FormBase';
import { mutations, queries } from '../graphql';
import { IEngageMessageDoc, IEngageScheduleDate } from '../types';
import withFormMutations from './withFormMutations';

type Props = {
  kind?: string;
  brands: IBrand[];
  scheduleDate?: IEngageScheduleDate;
};

type FinalProps = {
  segmentsQuery: SegmentsQueryResponse;
  emailTemplatesQuery: EmailTemplatesQueryResponse;
  customerCountsQuery: CountQueryResponse;
  headSegmentsQuery: HeadSegmentsQueryResponse;
  combinedFieldsQuery: FieldsCombinedByTypeQueryResponse;
  users: IUser[];
  save: (doc: IEngageMessageDoc) => Promise<any>;
} & Props &
  AddMutationResponse;

const AutoAndManualFormContainer = (props: FinalProps) => {
  const {
    segmentsQuery,
    headSegmentsQuery,
    combinedFieldsQuery,
    segmentsAdd,
    emailTemplatesQuery,
    customerCountsQuery
  } = props;

  if (combinedFieldsQuery.loading) {
    return null;
  }

  const customerCounts = customerCountsQuery.customerCounts || {
    bySegment: {}
  };

  const segmentFields = combinedFieldsQuery.fieldsCombinedByContentType
    ? combinedFieldsQuery.fieldsCombinedByContentType.map(
        ({ name, label, brand }) => ({
          _id: `${brand}-${name}`,
          title: label,
          brand,
          selectedBy: 'none'
        })
      )
    : [];

  const count = segment => {
    customerCountsQuery.refetch({
      byFakeSegment: segment
    });
  };

  const segmentAdd = ({ doc }) => {
    segmentsAdd({ variables: { ...doc } })
      .then(() => {
        segmentsQuery.refetch();
        customerCountsQuery.refetch();
        Alert.success('You successfully added a segment');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  if (emailTemplatesQuery.loading) {
    return null;
  }

  const updatedProps = {
    ...props,
    headSegments: headSegmentsQuery.segmentsGetHeads || [],
    segmentFields,
    segmentAdd,
    segments: segmentsQuery.segments || [],
    templates: emailTemplatesQuery.emailTemplates || [],
    customerCounts: customerCounts.bySegment || {},
    count
  };

  const content = formProps => (
    <AutoAndManualForm {...updatedProps} {...formProps} />
  );

  return <FormBase kind={props.kind || ''} content={content} />;
};

export default withFormMutations<Props>(
  withProps<Props>(
    compose(
      graphql<Props, EmailTemplatesQueryResponse>(gql(queries.emailTemplates), {
        name: 'emailTemplatesQuery'
      }),
      graphql<Props, SegmentsQueryResponse>(gql(queries.segments), {
        name: 'segmentsQuery'
      }),
      graphql<Props, CountQueryResponse, { only: string }>(
        gql(queries.customerCounts),
        {
          name: 'customerCountsQuery',
          options: {
            variables: {
              only: 'bySegment'
            }
          }
        }
      ),
      graphql<Props, HeadSegmentsQueryResponse>(gql(queries.headSegments), {
        name: 'headSegmentsQuery'
      }),
      graphql<Props, FieldsCombinedByTypeQueryResponse>(
        gql(queries.combinedFields),
        { name: 'combinedFieldsQuery' }
      ),
      graphql<Props, AddMutationResponse, AddMutationVariables>(
        gql(mutations.segmentsAdd),
        { name: 'segmentsAdd' }
      )
    )(AutoAndManualFormContainer)
  )
);
