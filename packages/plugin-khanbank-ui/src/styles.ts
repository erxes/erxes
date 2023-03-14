import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

export const ConfigList = styled.div`
  a {
    padding: 0;
  }
`;

export const FlexRow = styled.div`
  flex: 1;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;

  > div:first-child {
    padding-right: ${dimensions.coreSpacing}px;
  }
`;

export const Block = styled.div`
  border-bottom: 1px dashed ${colors.borderPrimary};
  margin-bottom: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
  padding-bottom: ${dimensions.unitSpacing}px;

  .Select {
    min-width: 300px;
  }

  > h4 {
    margin-bottom: ${dimensions.coreSpacing}px;
    color: ${colors.colorPrimary};
  }
`;

export const BlockRow = styled(FlexRow)`
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;

  > div {
    padding-right: ${dimensions.coreSpacing}px;
    width: 25%;

    &.description {
      width: 50%;
    }

    @media (max-width: 1250px) {
      flex: 1;
    }
  }
`;

export const AccountList = styled.div`
  margin-top: ${dimensions.unitSpacing}px;
  padding: ${dimensions.coreSpacing}px;
`;

export const Content = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

export const WidgetButton = styled.div`
  cursor: pointer;
  text-align: center;
  width: 100%;
  position: relative;
  transition: all 0.3s ease;
  color: ${colors.textSecondary};

  span {
    position: absolute;
    top: -4px;
    right: -8px;
    padding: 3px;
    min-width: 18px;
    min-height: 18px;
    line-height: 12px;
  }
`;
