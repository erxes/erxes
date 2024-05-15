import { gql, useQuery, useMutation } from '@apollo/client';
import React, { useEffect, useRef } from 'react';
import {
  GetNotificationByEmailMutationResponse,
  GetNotificationByEmailMutationVariables,
  NotificationConfigsQueryResponse,
  NotificationModulesQueryResponse,
  SaveNotificationConfigMutationResponse,
  SaveNotificationConfigMutationVariables,
} from '@erxes/ui-notifications/src/types';
import NotificationSettings from '../components/NotificationSettings';
import { IUser } from '@erxes/ui/src/auth/types';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { Alert } from '@erxes/ui/src/utils';
import { IQueryParams } from '@erxes/ui/src/types';
import { mutations, queries } from '@erxes/ui-notifications/src/graphql';
import { currentUser as currentUserQuery } from '@erxes/ui/src/auth/graphql';

type Props = {
  queryParams: IQueryParams;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const NotificationSettingsContainer = (props: FinalProps) => {
  const { currentUser } = props;

  const isMounted = useRef(true);

  useEffect(() => {
    // Set isMounted to false when the component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Queries
  const notificationModulesQuery = useQuery<NotificationModulesQueryResponse>(
    gql(queries.notificationsModules),
  );
  const notificationConfigurationsQuery =
    useQuery<NotificationConfigsQueryResponse>(
      gql(queries.notificationsGetConfigurations),
    );

  // Mutations
  const [configGetNotificationByEmailMutation] = useMutation<
    GetNotificationByEmailMutationResponse,
    GetNotificationByEmailMutationVariables
  >(gql(mutations.configGetNotificationByEmail), {
    refetchQueries: [
      {
        query: gql(currentUserQuery)
      }
    ]
  });

  const [saveNotificationConfigurationsMutation] = useMutation<
    SaveNotificationConfigMutationResponse,
    SaveNotificationConfigMutationVariables
  >(gql(mutations.saveNotificationConfigurations));

  // Methods
  // save get notification by email
  const configGetNotificationByEmail = (variables) => {
    configGetNotificationByEmailMutation({ variables })
      .then(() => {
        if (isMounted.current) {
          Alert.success('You successfully changed a notification setting');
        }
      })
      .catch((error) => {
        if (isMounted.current) {
          Alert.success(error.message);
        }
      });
  };

  // save notification configurations
  const saveNotificationConfigurations = (variables) => {
    saveNotificationConfigurationsMutation({ variables })
      .then(() => {
        if (isMounted.current) {
          Alert.success('You successfully changed a notification setting');
          notificationConfigurationsQuery.refetch();
        }
      })
      .catch((error) => {
        if (isMounted.current) {
          Alert.success(error.message);
        }
      });
  };

  // Definitions
  const configs =
    notificationConfigurationsQuery?.data?.notificationsGetConfigurations || [];

  // default value is checked
  let getNotificationByEmail = currentUser.getNotificationByEmail;
  if (getNotificationByEmail === undefined || getNotificationByEmail === null) {
    getNotificationByEmail = false;
  }

  const updatedProps = {
    ...props,
    modules: notificationModulesQuery?.data?.notificationsModules || [],
    configs,
    saveNotificationConfigurations,

    getNotificationByEmail,
    configGetNotificationByEmail,
  };

  return <NotificationSettings {...updatedProps} />;
};

export default withCurrentUser(NotificationSettingsContainer);
