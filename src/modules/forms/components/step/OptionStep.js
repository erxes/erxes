import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'modules/common/components';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import { FlexItem, LeftItem, Preview, Title } from './style';

const propTypes = {
  type: PropTypes.string,
  calloutTitle: PropTypes.string,
  btnText: PropTypes.string,
  bodyValue: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  image: PropTypes.string,
  onChange: PropTypes.func,
  fields: PropTypes.array,
  brand: PropTypes.object,
  brands: PropTypes.array,
  onFieldEdit: PropTypes.func
};

class OptionStep extends Component {
  constructor(props) {
    super(props);

    this.renderPreview = this.renderPreview.bind(this);
    this.handleBrandChange = this.handleBrandChange.bind(this);
    this.onChangeLanguage = this.onChangeLanguage.bind(this);
  }

  handleBrandChange(value) {
    this.props.onChange('brand', value);
  }

  onChangeLanguage(value) {
    this.props.onChange('language', value);
  }

  renderPreview() {
    const {
      calloutTitle,
      bodyValue,
      btnText,
      color,
      theme,
      image,
      type,
      fields,
      onChange,
      onFieldEdit
    } = this.props;

    if (type === 'shoutbox') {
      return (
        <ShoutboxPreview
          calloutTitle={calloutTitle}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
          fields={fields}
          onChange={onChange}
          onFieldEdit={onFieldEdit}
        />
      );
    } else if (type === 'popup') {
      return (
        <PopupPreview
          calloutTitle={calloutTitle}
          bodyValue={bodyValue}
          btnText={btnText}
          color={color}
          theme={theme}
          image={image}
          fields={fields}
          onChange={onChange}
          onFieldEdit={onFieldEdit}
        />
      );
    }
    return (
      <EmbeddedPreview
        calloutTitle={calloutTitle}
        bodyValue={bodyValue}
        btnText={btnText}
        color={color}
        theme={theme}
        image={image}
        fields={fields}
        onChange={onChange}
        onFieldEdit={onFieldEdit}
      />
    );
  }

  render() {
    const { __ } = this.context;
    const { brands, brand = {} } = this.props;

    return (
      <FlexItem>
        <LeftItem>
          <Title>{__('Brand')}</Title>
          <FormControl
            componentClass="select"
            defaultValue={brand._id}
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
            onChange={e => this.onChangeLanguage(e.target.value)}
          >
            <option />
            <option value="mn">Монгол</option>
            <option value="en">English</option>
          </FormControl>
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
