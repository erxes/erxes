import { formatText } from 'modules/activityLogs/utils';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import IntegrationIcon from 'modules/common/components/IntegrationIcon';
import Tip from 'modules/common/components/Tip';
import { Column, Columns, Title } from 'modules/common/styles/chooser';
import { CenterContent, ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IBrandDoc } from 'modules/settings/brands/types';
import { IChannelDoc } from 'modules/settings/channels/types';
import React from 'react';
import { BrandName, IntegrationName } from '../../styles';
import { IIntegration } from '../../types';

type Props = {
  current: IChannelDoc | IBrandDoc;
  save: (ids: string[]) => void;
  search: (searchValue: string, check?: boolean) => void;
  allIntegrations: IIntegration[];
  perPage: number;
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

  handleChange = (type, integration) => {
    const { selectedIntegrations } = this.state;

    if (type === 'plus-1') {
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
        <IntegrationName>
          {integration.name}
          <Tip text={formatText(integration.kind)}>
            <div>
              <IntegrationIcon integration={integration} size={18} />
            </div>
          </Tip>
        </IntegrationName>
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
      icon === 'plus-1' &&
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
                this.renderRow(integration, 'plus-1')
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
                this.renderRow(integration, 'times')
              )}
            </ul>
          </Column>
        </Columns>

        <ModalFooter>
          <Button btnStyle="simple" icon="times-circle" onClick={closeModal}>
            Cancel
          </Button>
          <Button btnStyle="success" icon="check-circle" onClick={this.save}>
            Save
          </Button>
        </ModalFooter>
      </div>
    );
  }
}

export default ManageIntegrations;
