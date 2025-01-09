import React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Alert, __, confirm } from '@erxes/ui/src/utils';
import {
  EngageConfigQueryResponse,
  EngageVerifiedEmailsQueryResponse,
} from '@erxes/ui-engage/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import EngageSettingsContent from '../components/EngageSettingsContent';
import Spinner from '@erxes/ui/src/components/Spinner';
import {
  mutations as engageMutations,
  queries as engageQueries,
} from '@erxes/ui-engage/src/graphql';
import { gql } from '@apollo/client';
import { IButtonMutateProps } from '@erxes/ui/src/types';

const SettingsContainer = () => {
  const { loading: loadingConfigDetail, data: configDetailData, refetch: refetchConfigDetail } = useQuery<EngageConfigQueryResponse>(
    gql(engageQueries.engagesConfigDetail)
  );

  const { loading: loadingVerifiedEmails, data: verifiedEmailsData, refetch: refetchVerifiedEmails } = useQuery<EngageVerifiedEmailsQueryResponse>(
    gql(engageQueries.verifiedEmails)
  );

  const {loading: loadingUsers, data: usersData} = useQuery(gql(engageQueries.verifiedUsers))

  const [verifyEmailMutation] = useMutation(gql(engageMutations.verifyEmail));
  const [removeVerifiedEmailMutation] = useMutation(gql(engageMutations.removeVerifiedEmail));
  const [sendTestEmailMutation] = useMutation(gql(engageMutations.sendTestEmail));

  if (loadingConfigDetail || loadingVerifiedEmails || loadingUsers) {
    return <Spinner />;
  }

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callback = () => {
      refetchConfigDetail();
    };

    return (
      <ButtonMutate
        mutation={engageMutations.engagesUpdateConfigs}
        variables={values}
        callback={callback}
        refetchQueries={'engagesConfigDetail'}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={__(`You successfully updated engages config`)}
      />
    );
  };

  const verifyEmail = (email: string) => {
    verifyEmailMutation({ variables: { email } })
      .then(() => {
        refetchVerifiedEmails();
        Alert.success('Successfully sent verification email. Please check your inbox');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const removeVerifiedEmail = (email: string) => {
    confirm(__('You are about to remove verified email. Are your sure?')).then(() => {
      removeVerifiedEmailMutation({ variables: { email } })
        .then(() => {
          refetchVerifiedEmails();
          Alert.success('Successfully removed');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const sendTestEmail = (from: string, to: string, content: string) => {
    sendTestEmailMutation({
      variables: { from, to, content, title: 'This is a test' },
    })
      .then(() => {
        Alert.success('Successfully sent');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const configs = configDetailData?.engagesConfigDetail || [];
  const configsMap = configs.reduce((map, config) => {
    map[config.code] = config.value;
    return map;
  }, {});

  const verifiedUsers = usersData?.users || [];

  return (
    <EngageSettingsContent
      renderButton={renderButton}
      verifyEmail={verifyEmail}
      sendTestEmail={sendTestEmail}
      removeVerifiedEmail={removeVerifiedEmail}
      configsMap={configsMap}
      verifiedEmails={verifiedEmailsData?.engageVerifiedEmails || []}
      verifiedUsers={verifiedUsers}
    />
  );
};

export default SettingsContainer;
