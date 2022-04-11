import styled from "styled-components";
import styledTS from "styled-components-ts";
import { colors, dimensions } from '@erxes/ui/src/styles';
import {SectionContainer } from '@erxes/ui/src/layout/styles';

const Header = styled.div`
  h1 {
    margin: 20px 0 5px;
    font-size: 24px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: ${colors.colorCoreGray};
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const BoxedStep = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing}px;
  margin: ${dimensions.coreSpacing}px 0;
  padding: ${dimensions.unitSpacing}px;
`;  

const BoxHeader = styled.div`
  h4{
    color: ${colors.colorPrimary};
    font-weight: 700;
    margin: ${dimensions.unitSpacing / 2}px 0;
  }
  color: ${colors.colorCoreGray}
  align-items: center;
  margin: ${dimensions.coreSpacing}px;
`;



const Boxes = styled.div`
  width: 50%;
  position: relative;
  h3{
    border-bottom: none;
  }
  &:first-child {
    padding: 0 ${dimensions.unitSpacing}px;
  }
  &:last-child {
    padding: 0 ${dimensions.unitSpacing}px 0 0;
  }
  ${SectionContainer} {
    border-top: 1px solid ${colors.borderPrimary};
    padding-top: ${dimensions.unitSpacing /2}px;
    box-shadow: none;
    border-bottom: none;
    h3{
      text-transform: capitalize;
    }
  }
`;

const Card = styledTS<{backgroundImage: string}>(styled.div)`
  border-radius: ${dimensions.unitSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  margin: ${dimensions.coreSpacing}px 0;
  background-image: url("https://i.stack.imgur.com/90nGa.jpg");
  padding: ${dimensions.coreSpacing}px ${dimensions.coreSpacing * 2}px;

  ${Header} {
    max-width: 400px;
  }
`;

export { BoxedStep, BoxHeader, Left, Boxes, Card, Header }