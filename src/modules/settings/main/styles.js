import styled from 'styled-components';
import { dimensions, colors, typography } from 'modules/common/styles';

const Maincontent = styled.section`
  flex: 1;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 25px;
`;

const RowTitle = styled.h3`
  font-size: ${typography.fontSizeHeading8}px;
  font-weight: ${typography.fontWeightMedium};
  padding: ${dimensions.coreSpacing + 15}px;
  text-transform: uppercase;
  align-self: center;
  margin-bottom: 40px;
  color: ${colors.colorCoreDarkGray};
  flex-shrink: 0;
  min-width: 202px;

  &.second {
    margin-bottom: 17px;
  }
`;

const Box = styled.div`
  text-align: center;
  float: left;
  margin: 12px;
  background: ${colors.colorLightBlue};
  border-radius: 6px;
  width: 150px;
  min-height: 150px;
  cursor: pointer;
  box-shadow: 0px 8px 3px 0px rgba(136, 136, 136, 0.08);
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  img {
    width: 65px;
    transition: all 0.5s ease;
    padding: 27px 0 18px 0;
    transition-property: transform;
    transform: translateZ(0);
  }

  &:hover {
    box-shadow: 5px 10px 20px rgba(36, 37, 38, 0.13);
    font-weight: 600;

    img {
      transform: scale(1.1);
    }
  }
`;

const BoxContent = styled.div`
  border-bottom: 1px dotted #ccc;
  padding-bottom: 25px;
`;

const BoxName = styled.div`
  font-size: 11px;
  color: ${colors.colorCoreGray};
`;

export { Maincontent, Row, RowTitle, Box, BoxContent, BoxName };
