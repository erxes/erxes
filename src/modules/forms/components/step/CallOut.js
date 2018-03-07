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

    return (
      <FlexItem>
        <LeftItem>
          <Title>Callout title</Title>
          <FormControl
            id="callout-title"
            type="text"
            defaultValue={integration.title}
            value={this.state.title}
            onChange={this.onChangeText}
          />

          <Title>Callout body</Title>
          <FormControl defaultValue="Callout description here" />

          <Title>Callout button text</Title>
          <FormControl defaultValue="i'm callout button text" />

          <Title>Theme color</Title>
          <p>Try some of these colors:</p>

          <div>
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <Title>Featured image</Title>
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

export default CallOut;
