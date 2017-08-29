import React, { PropTypes } from 'react';
import Select from 'react-select-plus';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonToolbar,
  Modal,
} from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import SelectBrand from '../SelectBrand';
import CopyToClipboard from 'react-copy-to-clipboard';
import { CommonItem } from '../common';

const propTypes = {
  item: PropTypes.object,
  brands: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
};

class KbTopic extends CommonItem {
  constructor(props, context) {
    super(props, context);

    let code = '';

    // showed install code automatically in edit mode
    if (props.item) {
      code = this.constructor.getInstallCode(props.item._id);
    }

    this.state = {
      code,
      copied: false,
      selectedCategories: this.getSelectedCategories(),
    };

    this.handleBrandChange = this.handleBrandChange.bind(this);
  }

  getSelectedCategories() {
    const { item } = this.props;
    return (item && item.categoryIds) || [];
  }

  handleBrandChange() {
    if (this.props.item && this.props.item._id) {
      const code = this.constructor.getInstallCode(this.props.item._id);
      this.setState({ code, copied: false });
    }
  }

  static installCodeIncludeScript() {
    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${Meteor.settings.public.CDN_HOST}/knowledgeBaseWidget.bundle.js";
        script.async = true;

        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    `;
  }

  static getInstallCode(topicId) {
    return `
      <script>
        window.erxesSettings = {
          knowledgeBase: {
            topic_id: "${topicId}"
          },
        };
        ${KbTopic.installCodeIncludeScript()}
      </script>
    `;
  }

  render() {
    const item = this.props.item || {};
    const { brands } = this.props;

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup controlId="knowledgebase-title">
          <ControlLabel>Title</ControlLabel>
          <FormControl type="text" defaultValue={item.title} required />
        </FormGroup>

        <FormGroup controlId="knowledgebase-description">
          <ControlLabel>Description</ControlLabel>
          <FormControl type="text" defaultValue={item.description} />
        </FormGroup>

        <FormGroup>
          <SelectBrand
            brands={brands}
            defaultValue={item.brandId}
            onChange={this.handleBrandChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Categories</ControlLabel>

          <Select
            placeholder="Choose categories"
            onChange={items => {
              this.setState({ selectedCategories: items });
            }}
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            value={this.state.selectedCategories}
            options={this.getCategories()}
            multi
          />
        </FormGroup>

        {this.renderInstallCode()}

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }

  getCategories() {
    const results = [];

    const { categories } = this.props;

    results.push({
      label: 'Categories',
      options: categories.map(category => ({
        label: category.title,
        value: category._id,
      })),
    });
    return results;
  }

  renderInstallCode() {
    if (this.props.item && this.props.item._id) {
      return (
        <FormGroup controlId="install-code">
          <ControlLabel>Install code</ControlLabel>
          <div className="markdown-wrapper">
            <ReactMarkdown source={this.state.code} />
            {this.state.code
              ? <CopyToClipboard
                  text={this.state.code}
                  onCopy={() => this.setState({ copied: true })}
                >
                  <Button bsSize="small" bsStyle="primary">
                    {this.state.copied ? 'Copied' : 'Copy to clipboard'}
                  </Button>
                </CopyToClipboard>
              : null}
          </div>
        </FormGroup>
      );
    } else {
      return null;
    }
  }

  handleSubmit(e) {
    super.handleSubmit(e);

    let categoryIds = []; // TODO: refactor

    for (var i = 0; i < this.state.selectedCategories.length; i++) {
      categoryIds.push(this.state.selectedCategories[i].value);
    }

    this.props.save({
      title: document.getElementById('knowledgebase-title').value,
      description: document.getElementById('knowledgebase-description').value,
      brandId: document.getElementById('selectBrand').value,
      categoryIds: categoryIds,
    });

    this.context.closeModal();
  }
}

KbTopic.propTypes = propTypes;

export default KbTopic;
