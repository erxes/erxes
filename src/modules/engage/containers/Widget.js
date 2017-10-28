import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { MESSENGER_KINDS, SENT_AS_CHOICES, MESSAGE_KINDS } from '../constants';
import { Widget } from '../components';
import { mutations } from '../graphql';

const WidgetContainer = props => {
  const { emailTemplatesQuery, brandsQuery, messagesAddMutation } = props;

  if (emailTemplatesQuery.loading || brandsQuery.loading) {
    return null;
  }

  const emailTemplates = emailTemplatesQuery.emailTemplates;
  const brands = brandsQuery.brands;

  // save
  const save = (doc, callback) => {
    doc.kind = MESSAGE_KINDS.MANUAL;
    doc.isLive = true;

    messagesAddMutation({
      variables: doc
    }).then(() => {
      callback();
    });
  };

  const updatedProps = {
    ...props,
    emailTemplates,
    brands,
    save,
    messengerKinds: MESSENGER_KINDS.SELECT_OPTIONS,
    sentAsChoices: SENT_AS_CHOICES.SELECT_OPTIONS
  };

  return <Widget {...updatedProps} />;
};

WidgetContainer.propTypes = {
  emailTemplatesQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  messagesAddMutation: PropTypes.func
};

export default compose(
  graphql(
    gql`
      query emailTemplates {
        emailTemplates {
          _id
          name
          content
        }
      }
    `,
    { name: 'emailTemplatesQuery' }
  ),
  graphql(
    gql`
      query brands {
        brands {
          _id
          name
        }
      }
    `,
    { name: 'brandsQuery' }
  ),
  graphql(gql(mutations.messagesAdd), {
    name: 'messagesAddMutation'
  })
)(WidgetContainer);
