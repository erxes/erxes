import { colors, dimensions } from 'modules/common/styles';
import { SidebarList } from 'modules/layout/styles';
import styled from 'styled-components';

const Info = styled.div`
  margin-top: 5px;
  white-space: normal;

  > span {
    font-weight: normal;
  }
`;

const InfoTitle = styled.span`
  font-weight: 500;
  margin-bottom: 5px;
  margin-right: 10px;
`;

const InfoDetail = styled.p`
  margin: 0;
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
`;

const Action = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

const List = styled(SidebarList)`
  li {
    border-bottom: 1px solid ${colors.borderPrimary};
    color: ${colors.textPrimary};
    white-space: normal;
    padding: 10px 20px;

    span {
      color: ${colors.colorCoreLightGray};
      margin: 0;
    }

    &:last-child {
      border: none;
    }
  }
`;

const InfoAvatar = styled.img`
  width: 40px;
  border-radius: 40px;
`;

const Contact = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px solid ${colors.borderPrimary};
  padding: 10px 20px;
  position: relative;

  span {
    margin-right: ${dimensions.unitSpacing}px;
  }

  i {
    color: ${colors.colorCoreLightGray};
    cursor: pointer;
    position: absolute;
    right: ${dimensions.coreSpacing}px;
    top: 15px;
  }
`;

const Name = styled.div`
  flex: 1;
  word-break: break-word;
  margin-bottom: 10px;

  p {
    color: ${colors.colorCoreLightGray};
    margin: 0;
    font-size: 12px;
  }
`;

const TabContent = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const ClickableRow = styled.span`
  cursor: pointer;

  &:hover {
    color: ${colors.textSecondary};
  }

  i {
    font-size: 16px;
    textalign: center;
  }

  .icon-check-1 {
    color: ${colors.colorCoreGreen};
  }

  .icon-times {
    color: ${colors.colorCoreRed};
  }
`;

export {
  InfoTitle,
  InfoDetail,
  Info,
  Action,
  List,
  InfoAvatar,
  Contact,
  Name,
  TabContent,
  ClickableRow
};
