import styled from 'styled-components';
import { colors } from '../common/styles';

const CustomerWrapper = styled.div`
  border-top: 1px solid ${colors.borderPrimary};
  padding: 10px 20px;

  span {
    display: inline-block;
    width: 100%;
  }

  i {
    color: #aaaeb3;
    position: absolute;
    right: 20px;

    &:hover {
      cursor: pointer;
    }
  }
  ul {
    li {
      margin-left: 20px;
    }
  }
`;

const CustomersWrapper = styled.div`
  i {
    color: #aaaeb3;

    &:hover {
      cursor: pointer;
    }
  }
`;

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

export {
  CustomersWrapper,
  CustomerWrapper,
  CompaniesTableWrapper,
  CompanyLogo
};
