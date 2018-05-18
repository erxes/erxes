import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  Button,
  Icon,
  Tip,
  Label,
  ModalTrigger
} from 'modules/common/components';
import { ChooseBrand } from '../../brands/containers';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import { ModalFooter, CenterContent } from 'modules/common/styles/main';
import { Title, Columns, Column } from 'modules/common/styles/chooser';
import { BrandName, IntegrationName } from '../styles';

const propTypes = {
  current: PropTypes.object,
  save: PropTypes.func,
  type: PropTypes.string,
  search: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  allIntegrations: PropTypes.array.isRequired,
  perPage: PropTypes.number.isRequired,
  clearState: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

class ManageIntegration extends Component {
  constructor(props) {
    super(props);

    const current = props.current || {};

    this.state = {
      integrations: current.integrations || [],
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

  handleChange(type, integration) {
    const { integrations } = this.state;

    if (type === 'add') {
      this.setState({
        integrations: [...integrations, integration]
      });
    } else {
      this.setState({
        integrations: integrations.filter(item => item !== integration)
      });
    }
  }

  renderRowContent(integration, icon) {
    const brand = integration.brand || {};
    const { refetch, type } = this.props;

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

    if (type === 'brand' && icon !== 'add') {
      return (
        <ModalTrigger
          key={integration._id}
          title="Choose new brand"
          trigger={actionTrigger}
        >
          <ChooseBrand
            integration={integration}
            refetch={refetch}
            onSave={() => this.handleChange(icon, integration)}
          />
        </ModalTrigger>
      );
    }

    return actionTrigger;
  }

  renderRow(integration, icon) {
    if (
      icon === 'add' &&
      this.state.integrations.some(e => e._id === integration._id)
    ) {
      return null;
    }

    return this.renderRowContent(integration, icon);
  }

  render() {
    const { __ } = this.context;
    const { allIntegrations, current } = this.props;
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
              {current.name}&apos;s integration
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

ManageIntegration.propTypes = propTypes;
ManageIntegration.contextTypes = contextTypes;

export default ManageIntegration;
