import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  FormGroup,
  ControlLabel
} from 'modules/common/components';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import { FlexItem, LeftItem, Preview } from './style';

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
    this.onChangeFunction = this.onChangeFunction.bind(this);
  }

  onChangeFunction(name, value) {
    this.props.onChange(name, value);
  }

  renderPreview() {
    const { type } = this.props;

    if (type === 'shoutbox') {
      return <ShoutboxPreview {...this.props} />;
    }

    if (type === 'popup') {
      return <PopupPreview {...this.props} />;
    }

    return <EmbeddedPreview {...this.props} />;
  }

  render() {
    const { brands, brand = {} } = this.props;

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Brand</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={brand._id}
              id="selectBrand"
              onChange={e => this.onChangeFunction('brand', e.target.value)}
            >
              <option />
              {brands &&
                brands.map(brand => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Language</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={'en'}
              id="languageCode"
              onChange={e => this.onChangeFunction('language', e.target.value)}
            >
              <option />
              <option value="mn">Монгол</option>
              <option value="en">English</option>
            </FormControl>
          </FormGroup>
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
