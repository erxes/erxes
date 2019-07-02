import gql from 'graphql-tag';
import { withCurrentUser } from 'modules/auth/containers';
import { IUser } from 'modules/auth/types';
import { Alert, withProps } from 'modules/common/utils';
import { ICustomer } from 'modules/customers/types';
import { AddMutationResponse, IEngageMessageDoc } from 'modules/engage/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import { EmailTemplatesQueryResponse } from '../../settings/emailTemplates/containers/List';
import { Widget } from '../components';
import { MESSAGE_KINDS, MESSENGER_KINDS, SENT_AS_CHOICES } from '../constants';
import { mutations, queries } from '../graphql';
import { crudMutationsOptions } from '../utils';

type Props = {
  customers: ICustomer[];
  emptyBulk?: () => void;
  modalTrigger?: React.ReactNode;
};

type FinalProps = {
  currentUser: IUser;
  emailTemplatesQuery: EmailTemplatesQueryResponse;
  brandsQuery: BrandsQueryResponse;
} & Props &
  AddMutationResponse;

const WidgetContainer = (props: FinalProps) => {
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

        Alert.success(`You successfully added a engagement message`);

        if (emptyBulk) {
          emptyBulk();
        }
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

export default withProps<Props>(
  compose(
    graphql<Props, EmailTemplatesQueryResponse>(gql(queries.emailTemplates), {
      name: 'emailTemplatesQuery'
    }),
    graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
      name: 'brandsQuery'
    }),
    graphql<Props, AddMutationResponse, IEngageMessageDoc>(
      gql(mutations.messagesAdd),
      {
        name: 'messagesAddMutation',
        options: crudMutationsOptions
      }
    )
  )(withCurrentUser(WidgetContainer))
);
