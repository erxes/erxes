import { SidebarList } from 'modules/layout/styles';
import styled from 'styled-components';
import { colors, dimensions } from '../common/styles';

const CompaniesTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

    &:last-child {
      border: none;
    }
  }
`;

const FlexItem = styled.div`
  display: flex;
  align-items: center;
`;
const ButtonRelated = styled.div`
  text-align: center;
  button {
    background: rgba(0, 0, 0, 0.04);
    margin: 10px auto;
    color: #888;
    border: 0;
    border-radius: 25px;
    outline: none;
    cursor: pointer;
    font-size: 12px;
  }
`;
export { CompaniesTableWrapper, CompanyLogo, List, FlexItem, ButtonRelated };
