import { colors, dimensions } from '@erxes/ui/src/styles';

import styled from 'styled-components';

export const Sites = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: ${dimensions.coreSpacing}px;
`;

export const SiteBox = styled.div`
  width: 240px;
  margin-right: ${dimensions.coreSpacing}px;
`;

export const SitePreview = styled.div`
  width: 100%;
  height: 300px;
  border-radius: ${dimensions.unitSpacing - 2}px ${dimensions.unitSpacing - 2}px
    0 0;
  overflow: hidden;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Content = styled.div`
  background: #f5f5f5;
  padding: ${dimensions.unitSpacing + 2}px ${dimensions.coreSpacing}px;
  border-radius: 0 0 ${dimensions.unitSpacing - 2}px
    ${dimensions.unitSpacing - 2}px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  > i {
    cursor: pointer;
  }

  > div {
    display: flex;
    flex-direction: column;

    > b {
      font-size: 14px;
    }

    > span {
      color: ${colors.colorCoreGray};
    }
  }
`;
