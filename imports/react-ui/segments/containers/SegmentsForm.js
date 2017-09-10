import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { Customers } from '/imports/api/customers/customers';
import { SegmentsForm } from '../components';

const SegmentsFormContainer = props => {
  const { segmentDetailQuery, headSegmentsQuery } = props;

  if (segmentDetailQuery.loading || headSegmentsQuery.loading) {
    return null;
  }

  const fields = Customers.getPublicFields().map(({ key, label }) => ({
    _id: key,
    title: label,
    selectedBy: 'none',
  }));

  const segment = segmentDetailQuery.segmentDetail;
  const headSegments = headSegmentsQuery.headSegments;

  const updatedProps = {
    ...props,
    fields,
    segment,
    headSegments,

    create({ doc }, callback) {
      Meteor.call('customers.createSegment', doc, callback);
    },

    edit({ id, doc }, callback) {
      Meteor.call('customers.editSegment', { id, doc }, callback);
    },
  };

  return <SegmentsForm {...updatedProps} />;
};

SegmentsFormContainer.propTypes = {
  segmentDetailQuery: PropTypes.object,
  headSegmentsQuery: PropTypes.object,
};

const segmentFields = `
  _id
  name
  description
  subOf
  color
  connector
  conditions
`;

export default compose(
  graphql(
    gql`
      query segmentDetail($_id: String!) {
        segmentDetail(_id: $_id) {
          ${segmentFields}
          getSubSegments {
            ${segmentFields}
          }
        }
      }
    `,
    {
      name: 'segmentDetailQuery',
      options: ({ id }) => ({
        variables: {
          _id: id,
        },
      }),
    },
  ),
  graphql(
    gql`
      query headSegments {
        headSegments {
          ${segmentFields}
          getSubSegments {
            ${segmentFields}
          }
        }
      }
    `,
    {
      name: 'headSegmentsQuery',
    },
  ),
)(SegmentsFormContainer);
