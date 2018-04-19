/* eslint-disable no-underscore-dangle, react/no-string-refs,
  jsx-a11y/no-static-element-interactions, react/no-multi-comp,
  react/forbid-prop-types */

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import _ from 'underscore';
import strip from 'strip';
import PropTypes from 'prop-types';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import {
  FormControl,
  EmptyState,
  Button,
  Icon,
  Tip
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import ResponseTemplateModal from './ResponseTemplateModal';
import {
  ResponseTemplateStyled,
  PopoverHeader,
  InlineHeader,
  InlineColumn,
  PopoverFooter,
  PopoverBody,
  PopoverList,
  TemplateTitle,
  TemplateContent
} from '../styles';

const propTypes = {
  brandId: PropTypes.string.isRequired,
  responseTemplates: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  saveResponseTemplate: PropTypes.func.isRequired,
  attachments: PropTypes.array,
  brands: PropTypes.array,
  content: PropTypes.string.isRequired
};

class ResponseTemplate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      key: '',
      brandId: props.brandId,
      options: this.filterByBrand(props.brandId)
    };

    this.onSelect = this.onSelect.bind(this);
    this.onSave = this.onSave.bind(this);
    this.filterItems = this.filterItems.bind(this);
    this.onFilter = this.onFilter.bind(this);
    this.filterByBrand = this.filterByBrand.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.brandId !== this.props.brandId) {
      this.setState({
        brandId: this.props.brandId,
        options: this.filterByBrand(this.props.brandId)
      });
    }
  }

  onSave(brandId, name) {
    const doc = {
      brandId,
      name,
      content: this.props.content,
      files: this.props.attachments
    };

    this.props.saveResponseTemplate(doc, error => {
      if (error) return Alert.error(error.message);

      Alert.success('Congrats');

      return document.querySelector('button.close').click();
    });
  }

  onSelect(eventKey) {
    const responseTemplates = this.props.responseTemplates;

    // find response template using event key
    const responseTemplate = _.find(responseTemplates, t => t._id === eventKey);

    // hide selector
    this.refs.overlay.hide();

    return this.props.onSelect(responseTemplate);
  }

  onFilter(e) {
    const options = this.filterByBrand(e.target.value);
    this.setState({ options, brandId: e.target.value });
  }

  filterByBrand(brandId) {
    return _.filter(
      this.props.responseTemplates,
      option => option.brandId === brandId
    );
  }

  filterItems(e) {
    this.setState({ key: e.target.value });
  }

  renderItems() {
    const { options, key } = this.state;

    if (options.length === 0) {
      return <EmptyState icon="clipboard-1" text="No templates" />;
    }

    return options.map(item => {
      // filter items by key
      if (
        key &&
        item.name.toLowerCase().indexOf(key) < 0 &&
        (key && item.content.toLowerCase().indexOf(key) < 0)
      ) {
        return false;
      }

      return (
        <li key={item._id} onClick={() => this.onSelect(item._id)}>
          <TemplateTitle>{item.name}</TemplateTitle>
          <TemplateContent>{strip(item.content)}</TemplateContent>
        </li>
      );
    });
  }

  render() {
    const { brands, content, brandId } = this.props;
    const { __ } = this.context;

    const saveTrigger = (
      <Button id="response-template-handler" btnStyle="link">
        <Tip text={__('Save as template')}>
          <Icon icon="download-3" />
        </Tip>
      </Button>
    );

    const popover = (
      <Popover
        className="popover-template"
        id="templates-popover"
        title={__('Response Templates')}
      >
        <PopoverHeader>
          <InlineHeader>
            <InlineColumn>
              <FormControl
                type="text"
                placeholder={__('Search...')}
                onChange={this.filterItems}
                autoFocus
              />
            </InlineColumn>
            <InlineColumn>
              <FormControl
                componentClass="select"
                placeholder={__('Select Brand')}
                onChange={this.onFilter}
                defaultValue={this.state.brandId}
              >
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </FormControl>
            </InlineColumn>
          </InlineHeader>
        </PopoverHeader>

        <PopoverBody>
          <PopoverList>{this.renderItems()}</PopoverList>
        </PopoverBody>
        <PopoverFooter>
          <PopoverList center>
            <li>
              <Link to="/settings/response-templates">
                {__('Manage templates')}
              </Link>
            </li>
          </PopoverList>
        </PopoverFooter>
      </Popover>
    );

    return (
      <ResponseTemplateStyled>
        <OverlayTrigger
          trigger="click"
          placement="top"
          overlay={popover}
          rootClose
          ref="overlay"
        >
          <Button btnStyle="link">
            <Tip text={__('Response template')}>
              <Icon icon="clipboard-1" />
            </Tip>
          </Button>
        </OverlayTrigger>

        <ResponseTemplateModal
          trigger={strip(content) ? saveTrigger : <span />}
          brands={brands}
          brandId={brandId}
          onSave={this.onSave}
        />
      </ResponseTemplateStyled>
    );
  }
}

ResponseTemplate.propTypes = propTypes;
ResponseTemplate.contextTypes = {
  __: PropTypes.func
};

export default ResponseTemplate;
