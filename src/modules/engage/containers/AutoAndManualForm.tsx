import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { Alert } from 'modules/common/utils';
import { ISegmentCondition } from 'modules/segments/types';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { AutoAndManualForm } from '../components';
import FormBase from '../components/FormBase';
import { mutations, queries } from '../graphql';
import { IEngageMessageDoc, IEngageScheduleDate } from '../types';
import withFormMutations from './withFormMutations';

type Props = {
  segmentsQuery: any;
  emailTemplatesQuery: any;
  customerCountsQuery: any;
  headSegmentsQuery: any;
  combinedFieldsQuery: any;
  segmentsAddQuery: (
    params: {
      variables: {
        name: string;
        description: string;
        subOf: string;
        color: string;
        connector: string;
        conditions: ISegmentCondition[];
      };
    }
  ) => Promise<any>;
  kind: string;
  brands: IBrand[];
  users: IUser[];
  scheduleDate: IEngageScheduleDate;
  save: (doc: IEngageMessageDoc) => Promise<any>;
};

const AutoAndManualFormContainer = (props: Props) => {
  const {
    segmentsQuery,
    headSegmentsQuery,
    combinedFieldsQuery,
    segmentsAddQuery,
    emailTemplatesQuery,
    customerCountsQuery
  } = props;

  const customerCounts = customerCountsQuery.customerCounts || {
    all: 0,
    byBrand: {},
    byIntegrationType: {},
    bySegment: {},
    byTag: {}
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
    segmentsAddQuery({ variables: { ...doc } }).then(() => {
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

  return <FormBase kind={props.kind} content={content} />;
};

export default withFormMutations(
  compose(
    graphql(gql(queries.emailTemplates), { name: 'emailTemplatesQuery' }),
    graphql(gql(queries.segments), { name: 'segmentsQuery' }),
    graphql(gql(queries.customerCounts), { name: 'customerCountsQuery' }),
    graphql(gql(queries.headSegments), { name: 'headSegmentsQuery' }),
    graphql(gql(queries.combinedFields), { name: 'combinedFieldsQuery' }),
    graphql(gql(mutations.segmentsAdd), { name: 'segmentsAddQuery' })
  )(AutoAndManualFormContainer)
);
