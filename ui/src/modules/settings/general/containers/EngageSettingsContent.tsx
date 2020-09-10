import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import {
  mutations as engageMutations,
  queries as engageQueries
} from 'modules/engage/graphql';
import {
  EngageConfigQueryResponse,
  EngageVerifiedEmailsQueryResponse
} from 'modules/engage/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { queries } from '../../integrations/graphql';
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
          content
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
      gql(queries.engagesConfigDetail),
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
