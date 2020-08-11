import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Spinner from 'modules/common/components/Spinner';
import { Step, Steps } from 'modules/common/components/step';
import {
  ControlWrapper,
  FlexItem,
  Indicator,
  LeftItem,
  Preview,
  StepWrapper
} from 'modules/common/components/step/styles';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import { INTEGRATION_KINDS } from '../../constants';
import Accounts from '../../containers/Accounts';
import SelectBrand from '../../containers/SelectBrand';
import SelectChannels from '../../containers/SelectChannels';
import {
  AccountBox,
  AccountItem,
  AccountTitle,
  Content,
  ImageWrapper,
  MessengerPreview,
  TextWrapper
} from '../../styles';
import { IPages } from '../../types';

type Props = {
  kind: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  onAccountSelect: (accountId?: string) => void;
  pages: IPages[];
  accountId?: string;
  onRemoveAccount: (accountId: string) => void;
  callBack: () => void;
  loadingPages?: boolean;
};

type State = {
  selectedPages: string[];
  channelIds: string[];
};

class Facebook extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedPages: [],
      channelIds: []
    };
  }

  onSelectPages = (pageId: string) => {
    const { selectedPages } = this.state;
    if (selectedPages.includes(pageId)) {
      return this.setState({
        selectedPages: selectedPages.filter(item => item !== pageId)
      });
    }

    this.setState({ selectedPages: [...selectedPages, pageId] });
  };

  generateDoc = (values: {
    messengerName: string;
    brandId: string;
    accountId: string;
  }) => {
    const { accountId, kind } = this.props;

    return {
      name: values.messengerName,
      brandId: values.brandId,
      kind,
      accountId: accountId ? accountId : values.accountId,
      channelIds: this.state.channelIds,
      data: {
        pageIds: this.state.selectedPages
      }
    };
  };

  renderPages() {
    const { pages, loadingPages } = this.props;

    if (loadingPages) {
      return <Spinner objective={true} />;
    }

    if (pages.length === 0) {
      return <EmptyState icon="folder-2" text={__('There is no pages')} />;
    }

    return (
      <FlexItem>
        <LeftItem>
          <AccountBox>
            <AccountTitle>{__('Facebook Pages')}</AccountTitle>
            {pages.map(page => (
              <AccountItem key={page.id}>
                {page.name}

                <Button
                  uppercase={false}
                  btnStyle={
                    this.state.selectedPages.includes(page.id)
                      ? 'primary'
                      : 'simple'
                  }
                  onClick={this.onSelectPages.bind(this, page.id)}
                >
                  {this.state.selectedPages.includes(page.id)
                    ? __('Selected')
                    : __('Select')}
                </Button>
              </AccountItem>
            ))}
          </AccountBox>
        </LeftItem>
      </FlexItem>
    );
  }

  onChange = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState({ [key]: value } as Pick<State, keyof State>);
  };

  channelOnChange = (values: string[]) => this.onChange('channelIds', values);

  renderContent = (formProps: IFormProps) => {
    const { renderButton } = this.props;
    const { values, isSubmitted } = formProps;
    const { onRemoveAccount, onAccountSelect } = this.props;

    return (
      <>
        <Steps active={1}>
          <Step img="/images/icons/erxes-01.svg" title="Connect Account">
            <FlexItem>
              <LeftItem>
                <Accounts
                  kind="facebook"
                  addLink="fblogin"
                  onSelect={onAccountSelect}
                  onRemove={onRemoveAccount}
                />
              </LeftItem>
            </FlexItem>
          </Step>

          <Step img="/images/icons/erxes-04.svg" title="Connect Your Pages">
            {this.renderPages()}
          </Step>

          <Step
            img="/images/icons/erxes-16.svg"
            title="Integration Setup"
            noButton={true}
          >
            <FlexItem>
              <LeftItem>
                <FormGroup>
                  <ControlLabel required={true}>Integration Name</ControlLabel>
                  <p>
                    {__('Name this integration to differentiate from the rest')}
                  </p>
                  <FormControl
                    {...formProps}
                    name="messengerName"
                    required={true}
                  />
                </FormGroup>

                <SelectBrand
                  isRequired={true}
                  description={__(
                    'Which specific Brand does this integration belong to?'
                  )}
                  formProps={formProps}
                />

                <SelectChannels
                  defaultValue={this.state.channelIds}
                  isRequired={true}
                  onChange={this.channelOnChange}
                />
              </LeftItem>
            </FlexItem>
          </Step>
        </Steps>
        <ControlWrapper>
          <Indicator>
            {__('You are creating')}
            <strong> {this.props.kind}</strong> {__('integration')}
          </Indicator>
          <Button.Group>
            <Link to="/settings/integrations">
              <Button btnStyle="simple" icon="times-circle" uppercase={false}>
                Cancel
              </Button>
            </Link>
            {renderButton({
              name: 'integration',
              values: this.generateDoc(values),
              isSubmitted,
              callback: this.props.callBack
            })}
          </Button.Group>
        </ControlWrapper>
      </>
    );
  };

  renderForm = () => {
    return <Form renderContent={this.renderContent} />;
  };

  render() {
    let title = __('Facebook Posts');
    let description = __(
      'Connect your Facebook Posts to start receiving Facebook post and comments in your team inbox'
    );

    if (this.props.kind === INTEGRATION_KINDS.FACEBOOK_MESSENGER) {
      title = __('Facebook Messenger');
      description = __(
        'Connect your Facebook Messenger to start receiving Facebook messages in your team inbox'
      );
    }

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('App store'), link: '/settings/integrations' },
      { title }
    ];

    return (
      <StepWrapper>
        <Wrapper.Header title={title} breadcrumb={breadcrumb} />
        <Content>
          {this.renderForm()}

          <MessengerPreview>
            <Preview fullHeight={true}>
              <ImageWrapper>
                <TextWrapper>
                  <h1>
                    {__('Connect your')} {title}
                  </h1>
                  <p>{description}</p>
                  <img alt={title} src="/images/previews/facebook.png" />
                </TextWrapper>
              </ImageWrapper>
            </Preview>
          </MessengerPreview>
        </Content>
      </StepWrapper>
    );
  }
}

export default Facebook;
