import { colors, dimensions } from "../styles";
import styled, { keyframes } from "styled-components";

import React from "react";
import styledTS from "styled-components-ts";

export interface IAnimatedLoader {
  height?: string;
  width?: string;
  color?: string;
  round?: boolean;
  margin?: string;
  marginRight?: string;
  isBox?: boolean;
  withImage?: boolean;
}

const placeHolderShimmer = keyframes`
  0% { background-position: -468px 0 }
  100% { background-position: 468px 0 }
`;

const Loader = styledTS<IAnimatedLoader>(styled.div)`
  animation-duration: 1.25s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-name: ${placeHolderShimmer};
  animation-timing-function: linear;
  background: linear-gradient(to right, 
    ${(props) => (props.color ? props.color : colors.borderPrimary)} 8%, 
    ${(props) => (props.color ? colors.bgLight : colors.borderDarker)} 18%, 
    ${(props) => (props.color ? props.color : colors.borderPrimary)} 33%);
  background-size: 800px 200px;
  width: ${(props) => (props.width ? props.width : "100%")};
  height: ${(props) => (props.height ? props.height : "100%")};
  border-radius: ${(props) => (props.round ? "50%" : "2px")};
  margin-right: ${(props) => props.marginRight};
  margin: ${(props) => props.margin};
  position: relative;
  float: left;
`;

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
