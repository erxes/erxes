import gql from 'graphql-tag';
import Email from 'modules/activityLogs/components/items/email/Email';
import EngageEmail from 'modules/activityLogs/components/items/email/EngageEmail';
import { EmailDeliveryDetailQueryResponse } from 'modules/activityLogs/types';
import EmptyState from 'modules/common/components/EmptyState';
import { queries as engageQueries } from 'modules/engage/graphql';
import { EngageMessageDetailQueryResponse } from 'modules/engage/types';
import React from 'react';
import { useQuery } from 'react-apollo';
import { queries } from '../../graphql';

type Props = {
  activity: any;
  emailId: string;
  emailType: string;
};

export default (props: Props) => {
    const { emailId, emailType } = props;
    
    const { 
      loading: engageMessageDetailQueryLoading,
      error: engageMessageDetailQueryError,
      data: engageMessageDetailQueryData
    } = useQuery<EngageMessageDetailQueryResponse> (
      gql(engageQueries.engageMessageDetail), {
				skip: emailType === 'engage',
				variables: {
					_id: emailId
				}
			}
    );

    const { 
      loading: emailDeliveryDetailQueryLoading,
      error: emailDeliveryDetailQueryError,
      data: emailDeliveryDetailQueryData
    } = useQuery<EmailDeliveryDetailQueryResponse> (
      gql(queries.emailDeliveryDetail), {
				skip: emailType === 'engage',
				variables: {
					_id: emailId
				}
			}
    );
    
    if (engageMessageDetailQueryError || emailDeliveryDetailQueryError) {
      return <p>Error!</p>;
    }

    if (engageMessageDetailQueryLoading || emailDeliveryDetailQueryLoading) {
      return null;
    }

    if (emailType === 'engage') {
      if (!engageMessageDetailQueryData || !emailDeliveryDetailQueryData) {
        return <EmptyState icon="email-4" text="Email not found" />;
      }

      return (
        <EngageEmail
          {...props}
          email={engageMessageDetailQueryData.engageMessageDetail || []}
        />
      );
    }

    return (
      <Email
        {...props}
        email={emailDeliveryDetailQueryData.emailDeliveryDetail || []}
      />
    );
  };
