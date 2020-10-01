import { AppConsumer } from 'appContext';
import { IUser } from 'modules/auth/types';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import ControlLabel from 'modules/common/components/form/Label';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Table from 'modules/common/components/table';
import Tip from 'modules/common/components/Tip';
import WithPermission from 'modules/common/components/WithPermission';
import { IButtonMutateProps } from 'modules/common/types';
import { router } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { FlexItem, FlexRow } from 'modules/insights/styles';
import SelectBrands from 'modules/settings/brands/containers/SelectBrands';
import React from 'react';
import Select from 'react-select-plus';
import List from '../../common/components/List';
import { ICommonFormProps, ICommonListProps } from '../../common/types';
import { FilterContainer } from '../styles';
import { IWebhook } from '../types';
import WebhookAddForm from './WebhookAddForm';


type IProps = {
  removeWebhook: (webhook: IWebhook) => void;
  refetchQueries: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  queryParams?: any;
  configsEnvQuery?: any;
  editWebhook: (webhook: IWebhook) => void;
};

type FinalProps = ICommonListProps &
  ICommonFormProps &
  IProps & { currentUser: IUser };

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


  renderAddForm = props => {
    const { refetchQueries, renderButton } = this.props;

    return (
      <WebhookAddForm
        closeModal={props.closeModal}
        webhookActions={[]}
        refetchQueries={refetchQueries}
        renderButton={renderButton}
      />
    );
  };

  renderRemoveAction(webhook) {
    const { removeWebhook } = this.props;

    if (!removeWebhook) {
      return null;
    }

    const onClick = () => removeWebhook(webhook);

    return (
      <WithPermission action="webhooksRemove">
        <Tip text={__('Delete')} placement="top">
          <Button btnStyle="link" onClick={onClick} icon="times-circle" />
        </Tip>
      </WithPermission>
    );
  }

  renderForm = props => {

    const { refetchQueries, renderButton } = this.props;
    


    return (
      <WebhookAddForm
      renderButton={renderButton}
        closeModal={props.closeModal}
        webhookActions={props.object.actions}
        endpointUrl={props.object.url}
        refetchQueries={refetchQueries}
      />
    );
  };

  renderEditAction = (webhook) => {

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit Webhook')} placement="top">
          <Icon icon="pen-1" size={15} />
        </Tip>
      </Button>
    );

    const content = props => {
      return this.renderForm({ ...props, object: webhook });
    };

    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  };




  renderRows({ objects }: { objects: IWebhook[] }) {

    return objects.map(object => {

      return (
        <tr key={object._id}>
          <td>{object.url}</td>
          <td>
            <ActionButtons>
              {this.renderEditAction(object)}
              {this.renderRemoveAction(object)}
            </ActionButtons>
          </td>
        </tr>
      );
    });
  }

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

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;
    e.target.value = '';
    e.target.value = tmpValue;
  }

  onStatusChange = (status: { label: string; value: boolean }) => {
    router.setParams(this.props.history, { isActive: status.value });
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
        <FlexRow>
          {this.renderBrandChooser()}

          <FlexItem>
            <ControlLabel>{__('Type')}</ControlLabel>
            <Select
              placeholder={__('Choose webhook type')}
              value={this.props.queryParams.isActive || true}
              onChange={this.onStatusChange}
              clearable={false}
              options={[
                {
                  value: true,
                  label: 'Outgoing'
                },
                {
                  value: false,
                  label: 'Incoming'
                }
              ]}
            />
          </FlexItem>
        </FlexRow>
      </FilterContainer>
    );
  };

  renderContent = props => {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Enpoint')}</th>
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
            title="Webhooks"
            description="Webhooks allow you to listen for triggers in your app, which will send relevant data to external URLs in real-time."
          />
        }
        renderFilter={this.renderFilter}
        renderForm={this.renderAddForm}
        renderContent={this.renderContent}
        center={true}
        {...this.props}
      />
    );
  }
}

const WithConsumer = (props: IProps & ICommonListProps & ICommonFormProps) => {
  // tslint:disable-next-line:no-console
  console.log(props)
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <WebhookList {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
