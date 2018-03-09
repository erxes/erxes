import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, FormControl } from 'modules/common/components';
import { dimensions, colors } from 'modules/common/styles';
import { FlexItem, LeftItem, Preview, Title } from './style';

const ImageWrapper = styled.div`
  border: 1px dashed ${colors.borderDarker};
  border-radius: 5px;
  position: relative;
  background: ${colors.colorLightBlue};
`;

const ImageContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${dimensions.coreSpacing}px;
  min-height: 200px;
`;

const propTypes = {
  integration: PropTypes.object
};

class CallOut extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: ''
    };

    this.onChangeText = this.onChangeText.bind(this);
  }

  onChangeText(event) {
    this.setState({ title: event.target.value });
  }

  render() {
    const { integration } = this.props;
    const { __ } = this.context;

    return (
      <FlexItem>
        <LeftItem>
          <Title>{__('Callout title')}</Title>
          <FormControl
            id="callout-title"
            type="text"
            defaultValue={integration.title}
            value={this.state.title}
            onChange={this.onChangeText}
          />

          <Title>{__('Callout body')}</Title>
          <FormControl defaultValue="Callout description here" />

          <Title>{__('Callout button text')}</Title>
          <FormControl defaultValue="i'm callout button text" />

          <Title>{__('Theme color')}</Title>
          <p>{__('Try some of these colors:')}</p>

          <div>
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <Title>{__('Featured image')}</Title>
          <ImageWrapper>
            <ImageContent>
              <Button btnStyle="warning">Upload</Button>
            </ImageContent>
          </ImageWrapper>
        </LeftItem>
        <Preview>{this.state.title}</Preview>
      </FlexItem>
    );
  }
}

CallOut.propTypes = propTypes;
CallOut.contextTypes = {
  __: PropTypes.func
};

export default CallOut;
