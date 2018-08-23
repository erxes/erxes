import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { withCurrentUser } from 'modules/auth/containers';
import { MESSENGER_KINDS, SENT_AS_CHOICES, MESSAGE_KINDS } from '../constants';
import { Widget } from '../components';
import { queries, mutations } from '../graphql';
import { crudMutationsOptions } from '../utils';

const WidgetContainer = props => {
  const {
    currentUser,
    emailTemplatesQuery,
    brandsQuery,
    emptyBulk,
    messagesAddMutation
  } = props;

  if (emailTemplatesQuery.loading || brandsQuery.loading) {
    return null;
  }

  const emailTemplates = emailTemplatesQuery.emailTemplates;
  const brands = brandsQuery.brands;

  // save
  const save = (doc, callback) => {
    doc.kind = MESSAGE_KINDS.MANUAL;
    doc.isLive = true;
    doc.fromUserId = currentUser._id;

    messagesAddMutation({
      variables: doc
    })
      .then(() => {
        callback();
        emptyBulk();

        Alert.success('Congrats');
      })
      .catch(error => {
        Alert.error(error.message);
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
  currentUser: PropTypes.object,
  emailTemplatesQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  messagesAddMutation: PropTypes.func,
  emptyBulk: PropTypes.func
};

export default withRouter(
  compose(
    graphql(gql(queries.emailTemplates), { name: 'emailTemplatesQuery' }),
    graphql(gql(queries.brands), { name: 'brandsQuery' }),
    graphql(gql(mutations.messagesAdd), {
      name: 'messagesAddMutation',
      options: crudMutationsOptions
    })
  )(withCurrentUser(WidgetContainer))
);
