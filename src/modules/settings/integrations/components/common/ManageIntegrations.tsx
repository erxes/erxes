import {
  Button,
  FormControl,
  Icon,
  Label,
  Tip
} from 'modules/common/components';
import { Column, Columns, Title } from 'modules/common/styles/chooser';
import { CenterContent, ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import * as React from 'react';
import { BrandName, IntegrationName } from '../../styles';
import { IIntegration } from '../../types';

type Props = {
  current: any;
  save: (ids: string[]) => void;
  search: (searchValue: string, check?: boolean) => void;
  allIntegrations: IIntegration[];
  perPage: number;
  clearState: () => void;
  closeModal: () => void;
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

    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.search = this.search.bind(this);
    this.loadMore = this.loadMore.bind(this);
  }

  save() {
    const { selectedIntegrations } = this.state;
    const ids: string[] = [];

    selectedIntegrations.forEach(integration => {
      ids.push(integration._id);
    });

    this.props.save(ids);
    this.props.closeModal();
  }

  componentWillUnmount() {
    this.props.clearState();
  }

  componentWillReceiveProps(newProps) {
    const { allIntegrations, perPage } = newProps;

    this.setState({ hasMore: allIntegrations.length === perPage });
  }

  search(e) {
    if (this.timer) clearTimeout(this.timer);

    const { search } = this.props;
    const value = e.target.value;

    this.timer = setTimeout(() => {
      search(value);
      this.setState({ searchValue: value });
    }, 500);
  }

  loadMore() {
    this.setState({ hasMore: false });
    this.props.search(this.state.searchValue, true);
  }

  getTypeName(integration) {
    const kind = integration.kind;
    let type = 'messenger';

    if (kind === KIND_CHOICES.FORM) {
      type = 'form';
    } else if (kind === KIND_CHOICES.TWITTER) {
      type = 'twitter';
    } else if (kind === KIND_CHOICES.FACEBOOK) {
      type = 'facebook';
    }

    return type;
  }

  getIconByKind(integration) {
    const kind = integration.kind;
    let icon = 'chat';

    if (kind === KIND_CHOICES.FORM) {
      icon = 'form';
    } else if (kind === KIND_CHOICES.TWITTER) {
      icon = 'twitter';
    } else if (kind === KIND_CHOICES.FACEBOOK) {
      icon = 'facebook';
    }

    return icon;
  }

  handleChange(type, integration) {
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
  }

  renderRowContent(integration, icon) {
    const brand = integration.brand || {};
    const { renderConfirm } = this.props;

    const actionTrigger = (
      <li
        key={integration._id}
        onClick={() => this.handleChange(icon, integration)}
      >
        <IntegrationName>{integration.name}</IntegrationName>
        <Tip text={this.getTypeName(integration)}>
          <Label
            className={`label-${this.getTypeName(integration)} round`}
            ignoreTrans
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

      if (confirm) {
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
              onChange={e => this.search(e)}
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
                    icon="checked-1"
                  >
                    Load More
                  </Button>
                </CenterContent>
              )}
            </ul>
          </Column>
          <Column>
            <Title full>
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
