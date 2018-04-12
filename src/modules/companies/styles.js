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

export { CompaniesTableWrapper, CompanyLogo };
