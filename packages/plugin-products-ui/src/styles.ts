import { colors, dimensions, typography } from '@erxes/ui/src/styles';
import { lighten } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const InfoDetail = styled.p`
  margin: 0;
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
  word-break: break-all;
`;

const ProductContent = styled.div`
  padding: 12px 22px;
  word-break: break-word;
  background: rgba(10, 30, 65, 0.05);
  margin-top: 10px;
  transition: background 0.3s ease;
  border-radius: 3px;
  min-height: 50px;
  p {
    color: ${colors.textPrimary};
    font-size: 13px;
  }
  img,
  table,
  * {
    max-width: 576px !important;
  }
  ul,
  ol {
    padding-left: 20px;
    margin: 0 0 10px;
  }
  &:hover {
    background: rgba(10, 30, 65, 0.08);
    cursor: pointer;
  }
`;

const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 90%;
  margin: 0 auto;
`;

const ProductBarcodeContent = styledTS<{ isValid?: boolean }>(styled.div)`
  a {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    
    color: ${props =>
      props.isValid ? colors.colorCoreGreen : colors.colorCoreGray} !important;
  }

  a:hover {
    color: ${props =>
      props.isValid ? colors.colorCoreGreen : lighten(colors.textPrimary, 40)};
  }
`;

const BarcodeContentWrapper = styled.div`
  width: 0px;
  height: 0px;
  position: absolute;
  display: none;
  pointer-events: none;
`;

const SidebarContent = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
`;

export {
  InfoDetail,
  ProductContent,
  ContentBox,
  ProductBarcodeContent,
  BarcodeContentWrapper,
  SidebarContent
};
