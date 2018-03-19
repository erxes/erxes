import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import CopyToClipboard from 'react-copy-to-clipboard';
import { ChromePicker } from 'react-color';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  EmptyState
} from 'modules/common/components';
import {
  MarkdownWrapper,
  ColorPick,
  ColorPicker
} from 'modules/settings/styles';
import SelectBrand from '../SelectBrand';
import { ModalFooter } from 'modules/common/styles/styles';

const propTypes = {
  topic: PropTypes.object,
  save: PropTypes.func.isRequired,
  remove: PropTypes.func,
  brands: PropTypes.array.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class KnowledgeForm extends Component {
  constructor(props, context) {
    super(props, context);

    let code = '',
      color = '';

    // showed install code automatically in edit mode
    if (props.topic) {
      code = this.constructor.getInstallCode(props.topic._id);
      color = props.topic.color;
    }

    this.state = {
      copied: false,
      code,
      color
    };

    this.handleBrandChange = this.handleBrandChange.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.save = this.save.bind(this);
    this.remove = this.remove.bind(this);
  }

  onColorChange(e) {
    this.setState({ color: e.hex });
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => {
        this.context.closeModal();
      },
      this.props.topic
    );
  }

  remove() {
    const { remove, topic } = this.props;

    remove(topic._id);
  }

  static installCodeIncludeScript() {
    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${
          process.env.REACT_APP_CDN_HOST
        }/knowledgeBaseWidget.bundle.js";
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
        ${KnowledgeForm.installCodeIncludeScript()}
      </script>
    `;
  }

  renderInstallCode() {
    if (this.props.topic && this.props.topic._id) {
      return (
        <FormGroup>
          <ControlLabel>Install code</ControlLabel>
          <MarkdownWrapper>
            <ReactMarkdown source={this.state.code} />
            {this.state.code ? (
              <CopyToClipboard
                text={this.state.code}
                onCopy={() => this.setState({ copied: true })}
              >
                <Button size="small" btnStyle="primary" icon="ios-copy-outline">
                  {this.state.copied ? 'Copied' : 'Copy to clipboard'}
                </Button>
              </CopyToClipboard>
            ) : (
              <EmptyState icon="code" text="No copyable code" size="small" />
            )}
          </MarkdownWrapper>
        </FormGroup>
      );
    } else {
      return null;
    }
  }

  handleBrandChange() {
    if (this.props.topic && this.props.topic._id) {
      const code = this.constructor.getInstallCode(this.props.topic._id);
      this.setState({ code, copied: false });
    }
  }

  generateDoc() {
    const { topic } = this.props;

    return {
      ...topic,
      doc: {
        doc: {
          title: document.getElementById('knowledgebase-title').value,
          description: document.getElementById('knowledgebase-description')
            .value,
          brandId: document.getElementById('selectBrand').value,
          languageCode: document.getElementById('languageCode').value,
          color: this.state.color
        }
      }
    };
  }

  renderContent(topic = {}) {
    const { brands } = this.props;
    const { brand } = topic;
    const brandId = brand != null ? brand._id : '';

    const popoverTop = (
      <Popover id="color-picker">
        <ChromePicker color={this.state.color} onChange={this.onColorChange} />
      </Popover>
    );

    return (
      <div>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            id="knowledgebase-title"
            type="text"
            defaultValue={topic.title}
            required
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            id="knowledgebase-description"
            type="text"
            defaultValue={topic.description}
          />
        </FormGroup>

        <FormGroup>
          <SelectBrand
            brands={brands}
            defaultValue={brandId}
            onChange={this.handleBrandChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Language</ControlLabel>

          <FormControl
            componentClass="select"
            defaultValue={topic.languageCode || 'en'}
            id="languageCode"
          >
            <option />
            <option value="mn">Монгол</option>
            <option value="en">English</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose a custom color</ControlLabel>
          <div>
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="bottom"
              overlay={popoverTop}
            >
              <ColorPick full>
                <ColorPicker
                  style={{ backgroundColor: this.state.color }}
                  full
                />
              </ColorPick>
            </OverlayTrigger>
          </div>
        </FormGroup>
        {this.renderInstallCode()}
      </div>
    );
  }

  render() {
    const { topic } = this.props;

    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.save}>
        {this.renderContent(topic || {})}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={onClick}
            icon="close"
          >
            Cancel
          </Button>
          {topic && (
            <Button
              btnStyle="danger"
              type="button"
              onClick={this.remove}
              icon="close"
            >
              Delete
            </Button>
          )}
          <Button btnStyle="success" type="submit" icon="checkmark">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

KnowledgeForm.propTypes = propTypes;
KnowledgeForm.contextTypes = contextTypes;

export default KnowledgeForm;
