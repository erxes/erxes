import styled from "styled-components";
import styledTS from "styled-components-ts";
import { colors, dimensions } from '@erxes/ui/src/styles';
import {SectionContainer } from '@erxes/ui/src/layout/styles';

const Header = styled.div`
  h1 {
    margin: 20px 0 5px;
    font-size: 24px;
    font-weight: 900;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: ${colors.colorCoreGray};

    ul {
      padding-inline-start: 20px;
    }
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const BoxedStep = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
`;  

const BoxHeader = styled.div`
  h4{
    color: ${colors.colorPrimary};
    font-weight: 700;
    margin: ${dimensions.unitSpacing / 2}px 0;
  }
  color: ${colors.colorCoreGray};
  align-items: center;
  margin: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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

const Card = styledTS<{background: string}>(styled.div)`
  border-radius: ${dimensions.unitSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  margin: ${dimensions.coreSpacing}px 0;
  background: ${props => props.background};
  padding: ${dimensions.coreSpacing * 2}px ${dimensions.coreSpacing * 2}px;
  color: white;
  
  h4 {
    margin: 0 0 10px;
    font-weight: 700;
  }
  p {
    max-width: 400px;
  }
`;

export { BoxedStep, BoxHeader, Left, Boxes, Card, Header }