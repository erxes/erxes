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
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: 20px;
  background: ${colors.colorSecondary};
`;

const CompanyWrapper = styled.div`
  border-top: 1px solid ${colors.borderPrimary};
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: ${dimensions.coreSpacing}px;
  padding-right: ${dimensions.coreSpacing}px;
  width: 100%;

  &:first-of-type {
    border-top: none;
  }

  a {
    font-size: 12px;
  }

  span {
    display: inline-block;

    &:last-child {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      &:hover {
        cursor: pointer;
      }
    }
  }

  i {
    color: #aaaeb3;
    position: absolute;
    right: ${dimensions.coreSpacing}px;

    &:hover {
      cursor: pointer;
    }
  }
  ul {
    li {
      margin-left: ${dimensions.coreSpacing}px;
    }
  }
`;

export { CompaniesTableWrapper, CompanyLogo, CompanyWrapper };
