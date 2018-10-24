import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { Alert, withProps } from 'modules/common/utils';
import { ISegmentCondition } from 'modules/segments/types';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CountQueryResponse } from '../../customers/containers/filters/BrandFilter';
import {
  HeadSegmentsQueryResponse,
  SegmentsQueryResponse
} from '../../segments/containers/SegmentsList';
import { EmailTemplatesQueryResponse } from '../../settings/emailTemplates/containers/List';
import { AutoAndManualForm } from '../components';
import FormBase from '../components/FormBase';
import { mutations, queries } from '../graphql';
import { IEngageMessageDoc, IEngageScheduleDate } from '../types';
import withFormMutations from './withFormMutations';

type FieldsCombinedByType = {
  _id: number;
  name: string;
  label: string;
};

type FieldsCombinedByTypeQueryResponse = {
  fieldsCombinedByContentType: FieldsCombinedByType[];
};

type AddMutationVariables = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  connector: string;
  conditions: ISegmentCondition[];
};

type AddMutationResponse = {
  segmentsAdd: (
    params: {
      variables: AddMutationVariables;
    }
  ) => Promise<any>;
};

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

  const customerCounts = customerCountsQuery.customerCounts || {
    bySegment: {}
  };

  const segmentFields = combinedFieldsQuery.fieldsCombinedByContentType
    ? combinedFieldsQuery.fieldsCombinedByContentType.map(
        ({ name, label }) => ({
          _id: name,
          title: label,
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
    segmentsAdd({ variables: { ...doc } }).then(() => {
      segmentsQuery.refetch();
      customerCountsQuery.refetch();
      Alert.success('Success');
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
