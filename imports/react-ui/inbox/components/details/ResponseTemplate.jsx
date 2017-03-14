import { _ } from 'meteor/underscore';
import Alert from 'meteor/erxes-notifier';
import React, { PropTypes, Component } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import strip from 'strip';
import {
  Modal,
  ButtonToolbar,
  Button,
  FormGroup,
  FormControl,
  ControlLabel,
  Popover,
  OverlayTrigger,
} from 'react-bootstrap';

import { add } from '/imports/api/responseTemplates/methods';
import { ModalTrigger, EmptyState } from '/imports/react-ui/common';


const propTypes = {
  brandId: PropTypes.string.isRequired,
  responseTemplates: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  attachments: PropTypes.array,
  brands: PropTypes.array,
  content: PropTypes.string.isRequired,
};

class ResponseTemplate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      key: '',
      options: this.filterByBrand(props.brandId),
    };

    this.onSelect = this.onSelect.bind(this);
    this.onSave = this.onSave.bind(this);
    this.filterItems = this.filterItems.bind(this);
    this.onFilter = this.onFilter.bind(this);
    this.filterByBrand = this.filterByBrand.bind(this);
  }

  onSave() {
    const doc = {
      brandId: this.props.brandId,
      name: document.getElementById('template-name').value,
      content: this.props.content,
      files: this.props.attachments,
    };

    add.call({ doc }, (error) => {
      if (error) return Alert.error(error.message);

      Alert.success('Congrats');

      return document.querySelector('button.close').click();
    });
  }

  onSelect(eventKey) {
    if (eventKey === 'save') {
      return document.getElementById('response-template-handler').click();
    }

    const responseTemplates = this.props.responseTemplates;

    // find response template using event key
    const responseTemplate = _.find(responseTemplates, t => t._id === eventKey);

    return this.props.onSelect(responseTemplate);
  }

  onFilter(e) {
    const options = this.filterByBrand(e.target.value);
    this.setState({ options });
  }

  filterByBrand(brandId) {
    return _.filter(this.props.responseTemplates, option =>
      option.brandId === brandId,
    );
  }

  filterItems(e) {
    this.setState({ key: e.target.value });
  }

  renderItems() {
    const { options, key } = this.state;

    if (options.length === 0) {
      return (
        <EmptyState
          icon={<i className="ion-clipboard" />}
          text="No templates"
          size="small"
        />
      );
    }

    return options.map((item) => {
      // filter items by key
      if (key && item.name.toLowerCase().indexOf(key) < 0) {
        return false;
      }

      return (
        <li key={item._id} onClick={() => this.onSelect(item._id)}>
          <div className="template-title">{item.name}</div>
          <div className="template-content">{strip(item.content)}</div>
        </li>
      );
    });
  }


  render() {
    const { brands, content } = this.props;

    const saveTrigger = (
      <Button id="response-template-handler" bsStyle="link">
        <i className="ion-archive" /> Save as template
      </Button>
    );

    const popover = (
      <Popover className="popover-template" id="templates-popover" title="Response Templates">
        <div className="popover-header">
          <div className="inline-header">
            <div className="column">
              <FormControl
                type="text"
                placeholder="Search..."
                onChange={this.filterItems}
                autoFocus
              />
            </div>
            <div className="column">
              <span>Brand</span>

              <FormControl
                componentClass="select"
                placeholder="Select Brand"
                onChange={this.onFilter}
                defaultValue={this.props.brandId}
              >
                {brands.map(brand =>
                  <option key={brand._id} value={brand._id}>{brand.name}</option>,
                )}
              </FormControl>
            </div>
          </div>
        </div>

        <div className="popover-body">
          <ul className="popover-list">
            {this.renderItems()}
          </ul>
        </div>
        <div className="popover-footer">
          <ul className="popover-list linked text-center">
            <li>
              <a href={FlowRouter.path('settings/responseTemplates/list')}>Manage templates</a>
            </li>
          </ul>
        </div>
      </Popover>
    );

    return (
      <div className="response-template">
        <OverlayTrigger
          trigger="click"
          placement="top"
          overlay={popover}
          rootClose
        >
          <Button bsStyle="link" className="dropup">
            <i className="ion-clipboard" /> Response templates <span className="caret" />
          </Button>
        </OverlayTrigger>

        <ModalTrigger
          title="Create response template"
          trigger={strip(content) ? saveTrigger : <span />}
        >
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl id="template-name" type="text" required />
          </FormGroup>

          <Modal.Footer>
            <ButtonToolbar className="pull-right">
              <Button
                onClick={this.onSave}
                type="button"
                bsStyle="primary"
              >
                Save
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </ModalTrigger>
      </div>
    );
  }
}

ResponseTemplate.propTypes = propTypes;

export default ResponseTemplate;
