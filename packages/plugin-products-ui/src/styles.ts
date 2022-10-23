import { colors, dimensions, typography } from '@erxes/ui/src/styles';
import { lighten } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const InfoDetail = styled.p`
  margin: 0;
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
  word-break: break-all;
`;

export const ProductContent = styled.div`
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

export const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 640px;
  margin: 0 auto;
`;

export const ProductBarcodeContent = styledTS<{ isValid?: boolean }>(styled.li)`
  padding: 6px 20px;
  justify-content: flex-end;
  & a {
    padding: 0px;
    color: ${props =>
      props.isValid ? colors.colorCoreGreen : colors.colorCoreGray};
  }
  & a:hover {
    text-align: left;
    color: ${props =>
      props.isValid ? colors.colorCoreGreen : lighten(colors.textPrimary, 40)};
  }
`;

export const BarcodeInputWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
`;

export const BarcodePrintWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

export const BarcodePrintContent = styledTS<{
  width?: string;
  height?: string;
}>(styled.div)`
  display: flex;
  flex-direction: column;
`;
