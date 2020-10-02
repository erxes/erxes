import { AppConsumer } from 'appContext';
import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import ControlLabel from 'modules/common/components/form/Label';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import Table from 'modules/common/components/table';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import { router } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { Alert } from 'modules/common/utils';
import { FlexItem, FlexRow } from 'modules/insights/styles';
import SelectBrands from 'modules/settings/brands/containers/SelectBrands';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import List from '../../common/components/List';
import RowActions from '../../common/components/RowActions';
import { ICommonFormProps, ICommonListProps } from '../../common/types';
import { FilterContainer } from '../styles';
import { IWebhook } from '../types';
import WebhookAddForm from './WebhookForm';

type IProps = {
  refetchQueries: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  queryParams?: any;
  configsEnvQuery?: any;
} & ICommonListProps;

type FinalProps = IProps & { currentUser: IUser };

type States = {
  searchValue: string;
};

class WebhookList extends React.Component<FinalProps, States> {
  private timer?: NodeJS.Timer;

  constructor(props: FinalProps) {
    super(props);

    const {
      queryParams: { searchValue }
    } = props;

    this.state = {
      searchValue: searchValue || ''
    };
  }

  renderForm = props => {
    return <WebhookAddForm {...props} renderButton={this.props.renderButton} />;
  };

  renderRows({ objects }: { objects: IWebhook[] }) {
    return objects.map(object => {
      return (
        <tr key={object._id}>
          <td>{object.url}</td>
          <td>{object.status}</td>
          <RowActions
            {...this.props}
            object={object}
            size="lg"
            renderForm={this.renderForm}
            additionalActions={this.renderResetPassword}
          />
        </tr>
      );
    });
  }

  renderResetPassword = object => {
    const onCopy = () => {
      Alert.success('Copied');
    };

    return (
      <CopyToClipboard text={object.token} onCopy={onCopy}>
        <Button btnStyle="link">
          <Tip text={__('Copy token')} placement="top">
            <Icon icon="copy" size={15} />
          </Tip>
        </Button>
      </CopyToClipboard>
    );
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const searchValue = e.target.value;

    this.setState({ searchValue });

    this.timer = setTimeout(() => {
      router.setParams(this.props.history, { searchValue });
    }, 500);
  };

  renderBrandChooser() {
    const { configsEnvQuery = {}, history, queryParams } = this.props;

    const env = configsEnvQuery.configsGetEnv || {};

    if (env.USE_BRAND_RESTRICTIONS !== 'true') {
      return null;
    }

    const onSelect = brandIds => {
      router.setParams(history, { brandIds });
    };

    return (
      <FlexItem>
        <ControlLabel>{__('Brand')}</ControlLabel>
        <SelectBrands
          label={__('Choose brands')}
          onSelect={onSelect}
          value={queryParams.brandIds}
          name="selectedBrands"
        />
      </FlexItem>
    );
  }

  renderFilter = () => {
    return (
      <FilterContainer>
        <FlexRow>{this.renderBrandChooser()}</FlexRow>
      </FilterContainer>
    );
  };

  renderContent = props => {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Enpoint')}</th>
            <th>{__('Status')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{this.renderRows(this.props)}</tbody>
      </Table>
    );
  };

  breadcrumb() {
    return [
      { title: __('Settings'), link: '/settings' },
      { title: __('Webhooks') }
    ];
  }

  render() {
    return (
      <List
        formTitle={__('Add Webhook')}
        size="lg"
        breadcrumb={[
          { title: __('Settings'), link: '/settings' },
          { title: __('Webhooks') }
        ]}
        title={__('Webhooks')}
        leftActionBar={
          <HeaderDescription
            icon="/images/actions/21.svg"
            title="Outgoing webhooks"
            description="Webhooks allow you to listen for triggers in your app, which will send relevant data to external URLs in real-time."
          />
        }
        renderFilter={this.renderFilter}
        renderForm={this.renderForm}
        renderContent={this.renderContent}
        center={true}
        {...this.props}
      />
    );
  }
}

const WithConsumer = (props: IProps & ICommonListProps & ICommonFormProps) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <WebhookList {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
