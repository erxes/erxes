import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FormControl, Button, EmptyState } from 'modules/common/components';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import { FlexItem, LeftItem, Preview, Title, MarkdownWrapper } from './style';

const propTypes = {
  kind: PropTypes.string,
  title: PropTypes.string,
  btnText: PropTypes.string,
  bodyValue: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
  changeState: PropTypes.func,
  fields: PropTypes.array,
  integration: PropTypes.object,
  brands: PropTypes.array
};

class OptionStep extends Component {
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

  constructor(props) {
    super(props);

    let code = '';

    if (props.integration) {
      const brand = props.integration.brand || '';
      code = this.constructor.getInstallCode(brand.code);
    }

    this.state = {
      code,
      copied: false
    };

    this.renderPreview = this.renderPreview.bind(this);
    this.handleBrandChange = this.handleBrandChange.bind(this);
  }

  updateInstallCodeValue(brandId) {
    if (brandId) {
      const brand =
        this.props.brands.find(brand => brand._id === brandId) || '';

      const code = this.constructor.getInstallCode(brand.code);

      this.setState({ code, copied: false });
    }
  }

  handleBrandChange(value) {
    this.updateInstallCodeValue(value);
    this.props.changeState('selectBrand', value);
  }

  renderPreview() {
    const {
      title,
      bodyValue,
      btnText,
      color,
      theme,
      image,
      kind,
      fields
    } = this.props;

    if (kind === 'shoutbox') {
      return (
        <ShoutboxPreview
          title={title}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
          fields={fields}
        />
      );
    } else if (kind === 'popup') {
      return (
        <PopupPreview
          title={title}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
          fields={fields}
        />
      );
    }
    return (
      <EmbeddedPreview
        title={title}
        bodyValue={bodyValue}
        btnText={btnText}
        color={color}
        theme={theme}
        image={image}
        fields={fields}
      />
    );
  }

  render() {
    const { __ } = this.context;
    const { brands } = this.props;

    return (
      <FlexItem>
        <LeftItem>
          <Title>{__('Brand')}</Title>
          <FormControl
            componentClass="select"
            placeholder={__('Select Brand')}
            defaultValue=""
            id="selectBrand"
            onChange={e => this.handleBrandChange(e.target.value)}
          >
            <option />
            {brands &&
              brands.map(brand => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
          </FormControl>

          <Title>{__('Language')}</Title>
          <FormControl
            componentClass="select"
            defaultValue={'en'}
            id="languageCode"
          >
            <option />
            <option value="mn">Монгол</option>
            <option value="en">English</option>
          </FormControl>

          <Title>{__('Install code')}</Title>
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
        </LeftItem>
        <Preview>{this.renderPreview()}</Preview>
      </FlexItem>
    );
  }
}

OptionStep.propTypes = propTypes;
OptionStep.contextTypes = {
  __: PropTypes.func
};

export default OptionStep;
