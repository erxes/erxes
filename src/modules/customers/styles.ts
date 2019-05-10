import { colors, dimensions } from 'modules/common/styles';
import { lighten } from 'modules/common/styles/color';
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

const Date = styled.time`
  font-size: 12px;
`;

const TableHeadContent = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 0 0 20px;
  position: relative;
  cursor: pointer;

  .up {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 6px solid #d0d0d0;
    position: absolute;
    left: 2px;
    top: 3px;
  }
  .down {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid #d0d0d0;
    position: absolute;
    left: 2px;
    top: 11px;
  }
  .down.active {
    border-top: 6px solid #6569df;
  }
  .up.active {
    border-bottom: 6px solid #6569df;
  }
`;

const ImportButton = styled.label`
  border-radius: 30px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  padding: 6px 15px;
  background: ${colors.colorSecondary};
  font-size: 10px;
  color: ${colors.colorWhite};
  box-shadow: 0 2px 16px 0 ${lighten(colors.colorSecondary, 35)};

  i {
    margin-right: 5px;
  }

  &:hover {
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 2px 22px 0 ${lighten(colors.colorSecondary, 25)};
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
  Date,
  TabContent,
  TableHeadContent,
  ImportButton
};
