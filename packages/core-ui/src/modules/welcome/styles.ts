import styled from "styled-components";
// import styledTS from "styled-components-ts";
import { colors, dimensions } from '@erxes/ui/src/styles';
import {SectionContainer } from '@erxes/ui/src/layout/styles';

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

const Divider = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.unitSpacing / 2}px
    ${dimensions.unitSpacing * 10 + 25}px;

  @media (max-width: 1170px) {
    margin-left: ${dimensions.coreSpacing}px;
  }
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
    box-shadow: none;
    border-bottom: none;
  }
`;

export { BoxedStep, BoxHeader, Left, Divider, Boxes }