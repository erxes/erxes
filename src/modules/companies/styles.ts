import { SidebarList } from 'modules/layout/styles';
import styled from 'styled-components';
import { colors } from '../common/styles';

const CompaniesTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CompanyLogo = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: 20px;
  background: ${colors.colorSecondary};
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

const FlexItem = styled.div`
  display: flex;
  align-items: center;
`;

export { CompaniesTableWrapper, CompanyLogo, List, FlexItem };
