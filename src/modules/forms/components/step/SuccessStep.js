import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'modules/common/components';
import { EmbeddedPreview, PopupPreview, ShoutboxPreview } from './preview';
import { FlexItem, LeftItem, Preview, Title } from './style';

const propTypes = {
  kind: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  thankContent: PropTypes.string,
  successAction: PropTypes.string,
  changeState: PropTypes.func,
  formData: PropTypes.object
};

class SuccessStep extends Component {
  constructor(props) {
    super(props);

    this.onChangeContent = this.onChangeContent.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.handleSuccessActionChange = this.handleSuccessActionChange.bind(this);
  }

  handleSuccessActionChange() {
    this.setState({
      successAction: document.getElementById('successAction').value
    });
    this.props.changeState('successAction', this.props.successAction);
  }

  onChangeContent(value) {
    this.setState({ thankContent: value });
    this.props.changeState('thankContent', value);
  }

  renderPreview() {
    const { kind, color, theme, thankContent } = this.props;

    if (kind === 'shoutbox') {
      return (
        <ShoutboxPreview
          color={color}
          theme={theme}
          thankContent={thankContent}
        />
      );
    } else if (kind === 'popup') {
      return (
        <PopupPreview color={color} theme={theme} thankContent={thankContent} />
      );
    }
    return (
      <EmbeddedPreview
        color={color}
        theme={theme}
        thankContent={thankContent}
      />
    );
  }

  render() {
    const { __ } = this.context;
    const { thankContent } = this.props;

    return (
      <FlexItem>
        <LeftItem>
          <Title>{__('On success')}</Title>
          <FormControl
            componentClass="select"
            defaultValue=""
            onChange={this.handleSuccessActionChange}
            id="successAction"
          >
            <option />
            <option>email</option>
            <option>redirect</option>
            <option>onPage</option>
          </FormControl>

          <Title>{__('Thank content')}</Title>
          <FormControl
            id="description"
            componentClass="textarea"
            defaultValue={thankContent}
            onChange={e => this.onChangeContent(e.target.value)}
          />

          <Title>Form Name</Title>
          <FormControl
            id="integration-name"
            type="text"
            defaultValue=""
            required
          />

          <Title>Brand</Title>
          <FormControl
            componentClass="select"
            placeholder={__('Select Brand')}
            defaultValue=""
            id="selectBrand"
          >
            <option />
          </FormControl>
        </LeftItem>
        <Preview>{this.renderPreview()}</Preview>
      </FlexItem>
    );
  }
}

SuccessStep.propTypes = propTypes;
SuccessStep.contextTypes = {
  __: PropTypes.func
};

export default SuccessStep;
