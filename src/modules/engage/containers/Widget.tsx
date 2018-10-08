import gql from 'graphql-tag';
import { withCurrentUser } from 'modules/auth/containers';
import { IUser } from 'modules/auth/types';
import { Alert } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { IEngageMessageDoc } from 'modules/engage/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Widget } from '../components';
import { MESSAGE_KINDS, MESSENGER_KINDS, SENT_AS_CHOICES } from '../constants';
import { mutations, queries } from '../graphql';
import { crudMutationsOptions } from '../utils';

type Props = {
  currentUser: IUser;
  emailTemplatesQuery: any;
  brandsQuery: any;
  messagesAddMutation: (
    params: { variables: IEngageMessageDoc }
  ) => Promise<any>;
  customers: ICustomer[];
  emptyBulk: () => void;
};

const WidgetContainer = (props: Props) => {
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

export default compose(
  graphql(gql(queries.emailTemplates), { name: 'emailTemplatesQuery' }),
  graphql(gql(queries.brands), { name: 'brandsQuery' }),
  graphql(gql(mutations.messagesAdd), {
    name: 'messagesAddMutation',
    options: crudMutationsOptions
  })
)(withCurrentUser(WidgetContainer));
