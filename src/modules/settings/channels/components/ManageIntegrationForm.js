import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  Button,
  Icon,
  Tip,
  Label
} from 'modules/common/components';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import { LoadMore, Title, Columns, Column } from 'modules/customers/styles';
import { BrandName, IntegrationName } from '../../styles';
import { ModalFooter } from 'modules/common/styles/styles';

const propTypes = {
  currentChannel: PropTypes.object,
  save: PropTypes.func.isRequired,
  search: PropTypes.func.isRequired,
  allIntegrations: PropTypes.array.isRequired,
  perPage: PropTypes.number.isRequired,
  clearState: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

class ManageIntegrationForm extends Component {
  constructor(props) {
    super(props);

    const currentChannel = props.currentChannel || {};

    this.state = {
      integrations: currentChannel.integrations || [],
      hasMore: true,
      searchValue: ''
    };

    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.search = this.search.bind(this);
    this.loadMore = this.loadMore.bind(this);
  }

  save() {
    const { integrations } = this.state;
    const ids = [];

    integrations.forEach(integration => {
      ids.push(integration._id.toString());
    });

    this.props.save(ids);
    this.context.closeModal();
  }

  componentWillUnmount() {
    this.props.clearState();
  }

  componentWillReceiveProps(newProps) {
    const { allIntegrations, perPage } = newProps;

    this.setState({ hasMore: allIntegrations.length === perPage });
  }

  handleChange(type, integration) {
    const { integrations } = this.state;

    if (type === 'plus') {
      this.setState({
        integrations: [...integrations, integration]
      });
    } else {
      this.setState({
        integrations: integrations.filter(item => item !== integration)
      });
    }
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

    kind === KIND_CHOICES.FORM && (type = 'form');
    kind === KIND_CHOICES.TWITTER && (type = 'twitter');
    kind === KIND_CHOICES.FACEBOOK && (type = 'facebook');

    return type;
  }

  getIconByKind(integration) {
    const kind = integration.kind;
    let icon = 'chat';

    kind === KIND_CHOICES.FORM && (icon = 'file');
    kind === KIND_CHOICES.TWITTER && (icon = 'twitter');
    kind === KIND_CHOICES.FACEBOOK && (icon = 'facebook');

    return icon;
  }

  renderRow(integration, icon) {
    const brand = integration.brand || {};

    if (
      icon === 'plus' &&
      this.state.integrations.some(e => e._id === integration._id)
    ) {
      return null;
    }

    return (
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
            <Icon erxes icon={this.getIconByKind(integration)} />
          </Label>
        </Tip>
        <BrandName>{brand.name}</BrandName>
        <Icon icon={icon} />
      </li>
    );
  }

  render() {
    const { __ } = this.context;
    const { allIntegrations, currentChannel } = this.props;
    const selectedIntegrations = this.state.integrations;

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
                this.renderRow(integration, 'plus')
              )}
              {this.state.hasMore && (
                <LoadMore>
                  <Button
                    size="small"
                    btnStyle="primary"
                    onClick={this.loadMore}
                    icon="checked-1"
                  >
                    Load More
                  </Button>
                </LoadMore>
              )}
            </ul>
          </Column>
          <Column>
            <Title full>
              {currentChannel.name}
              {__('`s integration')}
              <span>({selectedIntegrations.length})</span>
            </Title>
            <ul>
              {selectedIntegrations.map(integration =>
                this.renderRow(integration, 'cancel-1')
              )}
            </ul>
          </Column>
        </Columns>
        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={() => this.context.closeModal()}
          >
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

ManageIntegrationForm.propTypes = propTypes;
ManageIntegrationForm.contextTypes = contextTypes;

export default ManageIntegrationForm;
