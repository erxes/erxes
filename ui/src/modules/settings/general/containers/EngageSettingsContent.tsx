import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { withRouter } from 'react-router-dom';
import EngageSettingsContent from '../components/EngageSettingsContent';

type Props = {
  engagesConfigDetailQuery: any;
  engagesVerifiedEmailsQuery: any;
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
      return <button>button</button>;
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

export default withProps<{}>(compose()(withRouter<Props>(SettingsContainer)));
