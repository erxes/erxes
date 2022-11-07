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

export const PreviewContent = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all ease 0.3s;
`;

export const SitePreview = styled.div`
  width: 100%;
  height: 300px;
  border-radius: ${dimensions.unitSpacing - 2}px ${dimensions.unitSpacing - 2}px
    0 0;
  overflow: hidden;
  position: relative;

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    ${PreviewContent} {
      opacity: 1;
    }
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
  height: calc(100% - 300px);

  .dropdown {
    margin-left: ${dimensions.unitSpacing}px;

    i {
      cursor: pointer;
    }
  }

  .dropdown-menu {
    li {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all ease 0.3s;
      padding: 3px ${dimensions.coreSpacing}px;

      &:hover {
        background: ${colors.bgActive};
      }

      > i {
        width: 20px;
      }
    }
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
