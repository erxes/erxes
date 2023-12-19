import { IAnimatedLoader } from '../types';
import { Loader } from '../styles/main';
import React from 'react';
import { dimensions } from '../styles';
import styled from 'styled-components';

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  padding: ${dimensions.coreSpacing}px;
  z-index: 3;
`;

const ImageBox = styled(Loader)`
  height: 50px;
  width: 50px;
  border-radius: 50px;
  margin-right: ${dimensions.coreSpacing}px;
`;

const Text = styled.div`
  width: 50%;

  &:nth-child(2) {
    margin-left: ${dimensions.coreSpacing}px;
  }
`;

const Box = styled.div`
  height: 200px;
  padding: 20px;
  z-index: 3;
`;

const Line = styled(Loader)`
  width: 100%;
  height: ${dimensions.unitSpacing}px;
`;

const Row = styled.div`
  display: flex;
  margin-bottom: ${dimensions.coreSpacing}px;
`;

type Props = {
  loaderStyle?: IAnimatedLoader;
};

class AnimatedLoader extends React.Component<Props> {
  render() {
    const { loaderStyle } = this.props;

    if (!loaderStyle) {
      return null;
    }

    if (loaderStyle.withImage) {
      return (
        <FlexRow>
          <ImageBox />
          <Text>
            <Line />
          </Text>
        </FlexRow>
      );
    }

    if (loaderStyle.isBox) {
      return (
        <Box>
          {[...Array(6)].map((b, index) => (
            <Row key={index}>
              <Text>
                <Line />
              </Text>
              <Text>
                <Line />
              </Text>
            </Row>
          ))}
        </Box>
      );
    }

    return <Loader {...loaderStyle} />;
  }
}

export default AnimatedLoader;
