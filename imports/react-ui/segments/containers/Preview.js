import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Customers } from '/imports/api/customers/customers';
import { Preview } from '../components';

class PreviewContainer extends React.Component {
  render() {
    const { customersQuery } = this.props;

    if (customersQuery.loading) {
      return null;
    }

    const updatedProps = {
      ...this.props,
      customers: customersQuery.customerListForSegmentPreview,
      customerFields: Customers.getPublicFields(),
    };

    return <Preview {...updatedProps} />;
  }
}

PreviewContainer.propTypes = {
  segment: PropTypes.object,
  customersQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query customerListForSegmentPreview($segment: JSON, $limit: Int) {
        customerListForSegmentPreview(segment: $segment, limit: $limit) {
          _id
          name
          email
          phone
          isUser
          integrationId
          createdAt
          messengerData
          twitterData
          facebookData
          tagIds
          getTags {
            _id
            name
          }
        }
      }
    `,
    {
      name: 'customersQuery',
      options: ({ segment }) => ({
        variables: {
          segment,
          limit: parseInt(FlowRouter.getQueryParam('limit'), 10) || 20,
        },
      }),
    },
  ),
)(PreviewContainer);
