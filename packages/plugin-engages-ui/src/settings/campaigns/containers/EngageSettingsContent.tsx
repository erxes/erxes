import React from 'react';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

import Spinner from '@erxes/ui/src/components/Spinner';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { __, Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  mutations as engageMutations,
  queries as engageQueries
} from '@erxes/ui-engage/src/graphql';
import {
  EngageConfigQueryResponse,
  EngageVerifiedEmailsQueryResponse
} from '@erxes/ui-engage/src/types';
import EngageSettingsContent from '../components/EngageSettingsContent';

type Props = {
  engagesConfigDetailQuery: EngageConfigQueryResponse;
  engagesVerifiedEmailsQuery: EngageVerifiedEmailsQueryResponse;
  engagesVerifyEmailMutation;
  engagesRemoveVerifiedEmailMutation;
  engagesSendTestEmailMutation;
} & IRouterProps;

class SettingsContainer extends React.Component<Props> {
  render() {
    const {
      engagesConfigDetailQuery,
      engagesVerifiedEmailsQuery,
      engagesVerifyEmailMutation,
      engagesRemoveVerifiedEmailMutation,
      engagesSendTestEmailMutation
    } = this.props;

    if (engagesConfigDetailQuery.loading) {
      return <Spinner />;
    }

    const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
      const callback = () => {
        engagesConfigDetailQuery.refetch();
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
      engagesVerifyEmailMutation({
        variables: {
          email
        }
      })
        .then(() => {
          engagesVerifiedEmailsQuery.refetch();
          Alert.success(
            'Successfully sent verification email. Please check your inbox'
          );
        })

        .catch(e => {
          Alert.error(e.message);
        });
    };

    const removeVerifiedEmail = (email: string) => {
      confirm(
        __('You are about to remove verified email. Are your sure?')
      ).then(() => {
        engagesRemoveVerifiedEmailMutation({
          variables: {
            email
          }
        })
          .then(() => {
            engagesVerifiedEmailsQuery.refetch();
            Alert.success('Successfully removed');
          })

          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const sendTestEmail = (from: string, to: string, content: string) => {
      engagesSendTestEmailMutation({
        variables: {
          from,
          to,
          content,
          title: 'This is a test'
        }
      })
        .then(() => {
          Alert.success('Successfully sent');
        })

        .catch(e => {
          Alert.error(e.message);
        });
    };

    const configs = engagesConfigDetailQuery.engagesConfigDetail || [];

    const configsMap = {};

    for (const config of configs) {
      configsMap[config.code] = config.value;
    }

    return (
      <EngageSettingsContent
        renderButton={renderButton}
        verifyEmail={verifyEmail}
        sendTestEmail={sendTestEmail}
        removeVerifiedEmail={removeVerifiedEmail}
        configsMap={configsMap}
        verifiedEmails={engagesVerifiedEmailsQuery.engageVerifiedEmails || []}
      />
    );
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, EngageVerifiedEmailsQueryResponse, {}>(
      gql(engageQueries.verifiedEmails),
      {
        name: 'engagesVerifiedEmailsQuery'
      }
    ),
    graphql<{}, EngageConfigQueryResponse, {}>(
      gql(engageQueries.engagesConfigDetail),
      {
        name: 'engagesConfigDetailQuery'
      }
    ),
    graphql(gql(engageMutations.verifyEmail), {
      name: 'engagesVerifyEmailMutation'
    }),
    graphql(gql(engageMutations.removeVerifiedEmail), {
      name: 'engagesRemoveVerifiedEmailMutation'
    }),
    graphql(gql(engageMutations.sendTestEmail), {
      name: 'engagesSendTestEmailMutation'
    })
  )(withRouter<Props>(SettingsContainer))
);
