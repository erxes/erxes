import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import Tip from 'modules/common/components/Tip';
import { Column, Columns, Title } from 'modules/common/styles/chooser';
import { CenterContent, ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IBrandDoc } from 'modules/settings/brands/types';
import { IChannelDoc } from 'modules/settings/channels/types';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import React from 'react';
import { BrandName, IntegrationName } from '../../styles';
import { IIntegration } from '../../types';

type Props = {
  current: IChannelDoc | IBrandDoc;
  save: (ids: string[]) => void;
  search: (searchValue: string, check?: boolean) => void;
  allIntegrations: IIntegration[];
  perPage: number;
  clearState: () => void;
  closeModal?: () => void;
  renderConfirm?: (
    integration: IIntegration,
    actionTrigger: React.ReactNode,
    icon: any,
    handleChange: (type: string, integration: IIntegration) => any
  ) => void;
};

type State = {
  selectedIntegrations: IIntegration[];
  hasMore: boolean;
  searchValue: string;
};

class ManageIntegrations extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props: Props) {
    super(props);

    const current = props.current || {};

    this.state = {
      selectedIntegrations: current.integrations || [],
      hasMore: true,
      searchValue: ''
    };
  }

  save = () => {
    const { selectedIntegrations } = this.state;
    const ids: string[] = [];

    selectedIntegrations.forEach(integration => {
      ids.push(integration._id);
    });

    this.props.save(ids);

    if (this.props.closeModal) {
      this.props.closeModal();
    }
  };

  componentWillUnmount() {
    this.props.clearState();
  }

  componentWillReceiveProps(newProps) {
    const { allIntegrations, perPage } = newProps;

    this.setState({ hasMore: allIntegrations.length === perPage });
  }

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { search } = this.props;
    const value = e.target.value;

    this.timer = setTimeout(() => {
      search(value);
      this.setState({ searchValue: value });
    }, 500);
  };

  loadMore = () => {
    this.setState({ hasMore: false });
    this.props.search(this.state.searchValue, true);
  };

  getTypeName(integration) {
    const kind = integration.kind;
    let type = 'messenger';

    if (kind === KIND_CHOICES.LEAD) {
      type = 'lead';
    } else if (kind === KIND_CHOICES.FACEBOOK_MESSENGER) {
      type = 'facebook-messenger';
    } else if (kind === KIND_CHOICES.FACEBOOK_POST) {
      type = 'facebook-post';
    } else if (kind === KIND_CHOICES.CALLPRO) {
      type = 'callpro';
    } else if (kind === KIND_CHOICES.CHATFUEL) {
      type = 'chatfuel';
    } else if (kind === KIND_CHOICES.GMAIL) {
      type = 'gmail';
    } else if (kind === KIND_CHOICES.NYLAS_GMAIL) {
      type = 'nylas-gmail';
    } else if (kind === KIND_CHOICES.TWITTER_DM) {
      type = 'twitter';
    } else if (kind === KIND_CHOICES.NYLAS_IMAP) {
      type = 'nylas-imap';
    } else if (kind === KIND_CHOICES.NYLAS_OFFICE365) {
      type = 'nylas-office365';
    } else if (kind === KIND_CHOICES.NYLAS_OUTLOOK) {
      type = 'nylas-outlook';
    } else if (kind === KIND_CHOICES.NYLAS_YAHOO) {
      type = 'nylas-yahoo';
    }

    return type;
  }

  getIconByKind(integration) {
    const kind = integration.kind;
    let icon = 'comment-alt';

    if (kind === KIND_CHOICES.LEAD) {
      icon = 'doc-text-inv-1';
    } else if (kind === KIND_CHOICES.FACEBOOK_MESSENGER) {
      icon = 'facebook-official';
    } else if (kind === KIND_CHOICES.FACEBOOK_POST) {
      icon = 'facebook-official';
    } else if (kind.includes(KIND_CHOICES.GMAIL)) {
      icon = 'mail-alt';
    } else if (kind === KIND_CHOICES.CALLPRO) {
      icon = 'phone-call';
    } else if (kind === KIND_CHOICES.TWITTER_DM) {
      icon = 'twitter';
    } else if (kind === KIND_CHOICES.CHATFUEL) {
      icon = 'comment-dots';
    } else if (kind === KIND_CHOICES.NYLAS_GMAIL) {
      icon = 'mail-alt';
    } else if (kind === KIND_CHOICES.NYLAS_IMAP) {
      icon = 'mail-alt';
    } else if (kind === KIND_CHOICES.NYLAS_OFFICE365) {
      icon = 'mail-alt';
    } else if (kind === KIND_CHOICES.NYLAS_OUTLOOK) {
      icon = 'mail-alt';
    } else if (kind === KIND_CHOICES.NYLAS_YAHOO) {
      icon = 'mail-alt';
    }

    return icon;
  }

  handleChange = (type, integration) => {
    const { selectedIntegrations } = this.state;

    if (type === 'add') {
      return this.setState({
        selectedIntegrations: [...selectedIntegrations, integration]
      });
    }

    return this.setState({
      selectedIntegrations: selectedIntegrations.filter(
        item => item !== integration
      )
    });
  };

  renderRowContent(integration, icon) {
    const brand = integration.brand || {};
    const { renderConfirm } = this.props;

    const onClick = () => this.handleChange(icon, integration);

    const actionTrigger = (
      <li key={integration._id} onClick={onClick}>
        <IntegrationName>{integration.name}</IntegrationName>
        <Tip text={this.getTypeName(integration)}>
          <Label
            className={`label-${this.getTypeName(integration)} round`}
            ignoreTrans={true}
          >
            <Icon icon={this.getIconByKind(integration)} />
          </Label>
        </Tip>
        <BrandName>{brand.name}</BrandName>
        <Icon icon={icon} />
      </li>
    );

    if (renderConfirm) {
      const confirm = renderConfirm(
        integration,
        actionTrigger,
        icon,
        this.handleChange
      );

      if (confirm !== undefined) {
        return confirm;
      }
    }

    return actionTrigger;
  }

  renderRow(integration, icon) {
    const { selectedIntegrations } = this.state;

    if (
      icon === 'add' &&
      selectedIntegrations.some(e => e._id === integration._id)
    ) {
      return null;
    }

    return this.renderRowContent(integration, icon);
  }

  render() {
    const { allIntegrations, current, closeModal } = this.props;
    const { selectedIntegrations } = this.state;

    return (
      <div>
        <Columns>
          <Column>
            <FormControl
              placeholder={__('Type to search')}
              onChange={this.search}
              autoFocus={true}
            />
            <ul>
              {allIntegrations.map(integration =>
                this.renderRow(integration, 'add')
              )}
              {this.state.hasMore && (
                <CenterContent>
                  <Button
                    size="small"
                    btnStyle="primary"
                    onClick={this.loadMore}
                    icon="angle-double-down"
                  >
                    Load More
                  </Button>
                </CenterContent>
              )}
            </ul>
          </Column>
          <Column>
            <Title full={true}>
              {current.name}
              &apos;s integration
              <span>({selectedIntegrations.length})</span>
            </Title>
            <ul>
              {selectedIntegrations.map(integration =>
                this.renderRow(integration, 'minus-circle')
              )}
            </ul>
          </Column>
        </Columns>

        <ModalFooter>
          <Button btnStyle="simple" icon="cancel-1" onClick={closeModal}>
            Cancel
          </Button>
          <Button btnStyle="success" icon="checked-1" onClick={this.save}>
            Save
          </Button>
        </ModalFooter>
      </div>
    );
  }
}

export default ManageIntegrations;
