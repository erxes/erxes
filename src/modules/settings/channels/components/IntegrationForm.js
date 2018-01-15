import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { FormControl, Button, Icon } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import {
  FormWrapper,
  InputsWrapper,
  ListWrapper,
  LoadMore,
  TitleSpan
} from 'modules/customers/styles';

const propTypes = {
  channel: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
  search: PropTypes.func.isRequired,
  allIntegrations: PropTypes.array.isRequired,
  integrations: PropTypes.array,
  perPage: PropTypes.number.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class IntegrationForm extends Component {
  constructor(props) {
    super(props);
    const integrations = this.props.integrations || [];

    this.state = {
      integrations,
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

  renderRow(integration, icon) {
    return (
      <li key={integration._id}>
        <Icon icon={icon} onClick={e => this.handleChange(e, integration)} />
        {integration.name}
      </li>
    );
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

  handleChange(e, integration) {
    const { integrations } = this.state;
    const type = e.target.getAttribute('icon');

    if (type === 'plus') {
      if (integrations.some(item => item._id === integration._id))
        return Alert.warning('Already added');
      this.setState({
        integrations: [...integrations, integration]
      });
    } else {
      this.setState({
        integrations: integrations.filter(item => item !== integration)
      });
    }
  }

  loadMore() {
    this.setState({ loadmore: false });
    this.props.search(this.state.searchValue, true);
  }

  render() {
    const { allIntegrations, channel } = this.props;

    return (
      <FormWrapper>
        <InputsWrapper>
          <FormControl
            placeholder="Type to search"
            onChange={e => this.search(e)}
          />
          <ul>
            {allIntegrations.map(integration =>
              this.renderRow(integration, 'plus')
            )}
            {this.state.loadmore && (
              <LoadMore onClick={this.loadMore}>Load More</LoadMore>
            )}
          </ul>
        </InputsWrapper>
        <ListWrapper>
          <TitleSpan>{channel.name}&apos;s integration</TitleSpan>
          <ul>
            {this.state.integrations.map(integration =>
              this.renderRow(integration, 'close')
            )}
          </ul>
        </ListWrapper>
        <Modal.Footer>
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
        </Modal.Footer>
      </FormWrapper>
    );
  }
}

IntegrationForm.propTypes = propTypes;
IntegrationForm.contextTypes = contextTypes;

export default IntegrationForm;
