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
  display: inline-block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
`;

const Action = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const List = SidebarList.extend`
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

const SidebarFlexRow = styled.li`
  white-space: inherit !important;
  display: flex !important;
  justify-content: space-between;

  span {
    color: ${colors.colorCoreGray};
    overflow: hidden;
    max-height: 140px;
    padding-left: ${dimensions.coreSpacing}px;
    text-align: right;
  }
`;

const CustomerInfoAvatar = styled.img`
  width: 40px;
  border-radius: 40px;
`;

export { InfoTitle, InfoDetail, Info, Action, List, SidebarFlexRow, CustomerInfoAvatar };
