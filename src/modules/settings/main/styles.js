import styled from 'styled-components';
import { dimensions, colors, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const Maincontent = styled.section`
  flex: 1;
  display: flex;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: ${dimensions.coreSpacing}px;
`;

const RowTitle = styled.h3`
  font-size: ${typography.fontSizeHeading8}px;
  font-weight: ${typography.fontWeightMedium};
  padding: ${dimensions.coreSpacing + 15}px;
  text-transform: uppercase;
  align-self: center;
  margin-bottom: ${dimensions.coreSpacing + 10}px;
  color: ${colors.colorCoreDarkGray};
  flex-shrink: 0;
  min-width: 210px;

  &.secondRow {
    margin-bottom: 0;
  }
`;

const Box = styled.div`
  text-align: center;
  float: left;
  background: ${colors.colorLightBlue};
  margin-right: ${dimensions.coreSpacing}px;
  margin-top: ${dimensions.coreSpacing}px;
  padding-top: ${dimensions.coreSpacing + 10}px;
  border-radius: 6px;
  width: 150px;
  min-height: 150px;
  cursor: pointer;
  box-shadow: 0 8px 5px ${rgba(colors.colorCoreGray, 0.08)};
  transition: all 0.25s ease;

  &.last {
    margin-right: 0;
  }

  img {
    width: 65px;
    transition: all 0.5s ease;
    transition-property: transform;
    transform: translateZ(0);
  }

  &:hover {
    box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)};
    font-weight: 500;

    img {
      transform: scale(1.1);
    }
  }
`;

const BoxContent = styled.div`
  border-bottom: 1px dotted ${colors.borderDarker};
  padding-bottom: ${dimensions.headerSpacing - 10}px;
  margin-right: ${dimensions.coreSpacing}px;
  margin-top: ${dimensions.coreSpacing}px;
`;

const BoxName = styled.span`
  font-size: ${typography.fontSizeUppercase}px;
  color: ${colors.colorCoreGray};
  display: block;
  padding-top: ${dimensions.coreSpacing}px;
`;

const Container = styled.div`
  overflow: auto;
  position: relative;
  flex: 1;
`;

const Contents = styled.div`
  margin-left: 20px;
`;

export {
  Maincontent,
  Row,
  RowTitle,
  Box,
  BoxContent,
  BoxName,
  Container,
  Contents
};
