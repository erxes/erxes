import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Button, EmptyState } from 'modules/common/components';
import { MarkdownWrapper } from '../styles';

const ModalFooter = styled.div`
  text-align: right;
  margin-top: 40px;
`;

const propTypes = {
  integration: PropTypes.object.isRequired
};

class Manage extends Component {
  static installCodeIncludeScript(type) {
    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${process.env.REACT_APP_CDN_HOST}/build/${
      type
    }Widget.bundle.js";
        script.async = true;

        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    `;
  }

  static getInstallCode(brandCode, formCode) {
    return `
      <script>
        window.erxesSettings = {
          forms: [{
            brand_id: "${brandCode}",
            form_id: "${formCode}",
          }],
        };
        ${Manage.installCodeIncludeScript('form')}
      </script>
    `;
  }

  constructor(props, context) {
    super(props, context);

    let code = '';
    const integration = props.integration || {};

    // showed install code automatically in edit mode
    if (integration._id) {
      const brand = integration.brand || {};
      const form = integration.form || {};

      code = this.constructor.getInstallCode(brand.code, form.code);
    }

    this.state = {
      code,
      copied: false
    };
  }

  render() {
    return (
      <div>
        <MarkdownWrapper>
          <ReactMarkdown source={this.state.code} />
          {this.state.code ? (
            <CopyToClipboard
              text={this.state.code}
              onCopy={() => this.setState({ copied: true })}
            >
              <Button size="small" btnStyle="primary" icon="copy">
                {this.state.copied ? 'Copied' : 'Copy to clipboard'}
              </Button>
            </CopyToClipboard>
          ) : (
            <EmptyState icon="copy" text="No copyable code" size="small" />
          )}
        </MarkdownWrapper>

        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={() => this.context.closeModal()}
          >
            Cancel
          </Button>
        </ModalFooter>
      </div>
    );
  }
}

Manage.propTypes = propTypes;
Manage.contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

export default Manage;
