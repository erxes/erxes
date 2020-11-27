import { rgba } from 'modules/common/styles/color';
import { SidebarList } from 'modules/layout/styles';
import styled from 'styled-components';
import { colors, dimensions } from '../common/styles';

const ContactsTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .expand {
    tr,
    td {
      white-space: pre-wrap;
    }
  }
`;

const ExpandRowWrapper = styled.div`
  background: ${rgba(colors.colorBlack, 0.05)};
  color: ${colors.colorCoreGray};
  transition: background 0.3s ease;
  padding: 2px ${dimensions.unitSpacing}px;
  border-radius: ${dimensions.unitSpacing}px;
  cursor: pointer;

  &.active {
    background: ${rgba(colors.colorSecondary, 0.1)};
    color: ${colors.colorSecondary};
  }
`;

const CompanyLogo = styled.div`
  width: ${dimensions.headerSpacing}px;
  height: ${dimensions.headerSpacing}px;
  border-radius: 25px;
  margin-right: ${dimensions.coreSpacing}px;
  background: ${colors.colorSecondary};
`;

const List = styled(SidebarList)`
  li {
    border-bottom: 1px solid ${colors.borderPrimary};
    color: ${colors.textPrimary};
    white-space: normal;
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;

    span {
      color: ${colors.colorCoreLightGray};
      margin: 0;
    }

    i {
      margin-left: ${dimensions.unitSpacing / 2}px;
    }

    &:last-child {
      border: none;
    }
  }
`;

const FlexItem = styled.div`
  display: flex;
  align-items: center;
`;

export { ContactsTableWrapper, ExpandRowWrapper, CompanyLogo, List, FlexItem };
