import { SidebarList } from 'modules/layout/styles';
import styled from 'styled-components';
import { colors, dimensions } from '../common/styles';

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

export { CompanyLogo, List, FlexItem };
