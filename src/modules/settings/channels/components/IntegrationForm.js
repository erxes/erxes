import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { FormControl, Button, Icon } from 'modules/common/components';
import {
  Footer,
  LoadMore,
  Title,
  Columns,
  Column
} from 'modules/customers/styles';

const propTypes = {
  currentChannel: PropTypes.object,
  save: PropTypes.func.isRequired,
  search: PropTypes.func.isRequired,
  allIntegrations: PropTypes.array.isRequired,
  perPage: PropTypes.number.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class IntegrationForm extends Component {
  constructor(props) {
    super(props);

    const currentChannel = props.currentChannel || {};

    this.state = {
      integrations: currentChannel.integrations || [],
      loadmore: true,
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
    this.props.search('');
  }

  componentWillReceiveProps(newProps) {
    const { allIntegrations, perPage } = newProps;

    this.setState({ loadmore: allIntegrations.length === perPage });
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
    this.setState({ loadmore: false });
    this.props.search(this.state.searchValue, true);
  }

  renderRow(integration, icon) {
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
        {integration.name}
        <Icon icon={icon} />
      </li>
    );
  }

  render() {
    const { allIntegrations, currentChannel } = this.props;
    const selectedIntegrations = this.state.integrations;

    return (
      <div>
        <Columns>
          <Column>
            <FormControl
              placeholder="Type to search"
              onChange={e => this.search(e)}
            />
            <ul>
              {allIntegrations.map(integration =>
                this.renderRow(integration, 'plus')
              )}
              {this.state.loadmore && (
                <LoadMore>
                  <Button
                    size="small"
                    btnStyle="primary"
                    onClick={this.loadMore}
                    icon="checkmark"
                  >
                    Load More
                  </Button>
                </LoadMore>
              )}
            </ul>
          </Column>
          <Column>
            <Title>
              {currentChannel.name}&apos;s integration
              <span>({selectedIntegrations.length})</span>
            </Title>
            <ul>
              {selectedIntegrations.map(integration =>
                this.renderRow(integration, 'close')
              )}
            </ul>
          </Column>
        </Columns>
        <Modal.Footer>
          <Footer>
            <Button
              btnStyle="simple"
              icon="close"
              onClick={() => this.context.closeModal()}
            >
              CANCEL
            </Button>
            <Button btnStyle="success" icon="checkmark" onClick={this.save}>
              SAVE
            </Button>
          </Footer>
        </Modal.Footer>
      </div>
    );
  }
}

IntegrationForm.propTypes = propTypes;
IntegrationForm.contextTypes = contextTypes;

export default IntegrationForm;
