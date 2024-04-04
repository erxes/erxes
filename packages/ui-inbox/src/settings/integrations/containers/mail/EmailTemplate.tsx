import * as React from 'react';

import { Alert } from '@erxes/ui/src/utils';
import EmailTemplate from '../../components/mail/emailTemplate/EmailTemplate';
import { IEmailTemplate } from '../../types';
import client from '@erxes/ui/src/apolloClient';
import debounce from 'lodash/debounce';
import { generateEmailTemplateParams } from '@erxes/ui-engage/src/utils';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';

type Props = {
  fetchMoreEmailTemplates: (page: number) => void;
  targets: Array<{ value: string; label: string }>;
  onSelect: (id: string) => void;
  totalCount?: number;
  history: any;
  loading?: boolean;
};

type State = {
  totalCount: number;
  filteredEmailTemplates: Array<{ value: string; label: string }>;
};

class EmailTemplateContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      totalCount: props.totalCount || 0,
      filteredEmailTemplates: props.targets || []
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.targets !== this.props.targets) {
      this.setState({
        filteredEmailTemplates: this.props.targets
      });
    }
  }

  onSearch = (searchValue: string) => {
    debounce(() => {
      client
        .query({
          query: gql(queries.emailTemplates),
          variables: {
            searchValue
          }
        })
        .then(
          (response: {
            loading: boolean;
            data: { emailTemplates?: IEmailTemplate[] };
          }) => {
            const filteredEmailTemplates = response.data.emailTemplates || [];

            this.setState({
              filteredEmailTemplates: generateEmailTemplateParams(
                filteredEmailTemplates
              ),
              totalCount: filteredEmailTemplates.length
            });
          }
        )
        .catch(error => {
          Alert.error(error.message);
        });
    }, 100)();
  };

  render() {
    const { filteredEmailTemplates } = this.state;

    const updatedProps = {
      ...this.props,
      emailTemplates: filteredEmailTemplates,
      onSearch: this.onSearch
    };

    return <EmailTemplate {...updatedProps} />;
  }
}

export default EmailTemplateContainer;
