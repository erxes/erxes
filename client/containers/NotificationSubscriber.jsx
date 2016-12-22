import React, { PropTypes } from 'react';
import gql from 'graphql-tag';

export default class ConversationItem extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (!this.subscription && !nextProps.data.loading) {
      const { subscribeToMore } = this.props.data;

      this.subscription = [subscribeToMore(
        {
          document: gql`subscription notification {notification}`,
          updateQuery: () => {
            this.props.data.refetch();
          },
        }
      )];
    }
  }
}

ConversationItem.propTypes = {
  data: PropTypes.object.isRequired,
};
