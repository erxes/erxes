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
  kind: PropTypes.string,
  changeState: PropTypes.func
};

class CallOut extends Component {
  render() {
    return (
      <FlexItem>
        <LeftItem>
          <Title>Featured image</Title>
          <ImageWrapper>
            <ImageContent>
              <Button btnStyle="warning">Upload</Button>
            </ImageContent>
          </ImageWrapper>

          <Title>Callout text</Title>
          <FormControl defaultValue="i'm callout text" />

          <Title>Callout body</Title>
          <FormControl defaultValue="i'm callout body" />

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
        </LeftItem>
        <Preview>right</Preview>
      </FlexItem>
    );
  }
}

CallOut.propTypes = propTypes;

export default CallOut;
