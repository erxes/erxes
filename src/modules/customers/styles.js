import styled from 'styled-components';
import { colors } from '../common/styles';
import { typography } from '../common/styles';

const AboutList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    padding: 6px 0px;
    color: ${colors.textPrimary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
    outline: 0;
  }
  > span {
    font-size: 12px;
    text-align: right;
    color: #888;
    margin-top: 2px;
    position: absolute;
    right: 20px;
  }
`;

const Aboutvalues = styled.span`
  font-size: 12px;
  text-align: right;
  color: ${colors.colorCoreGray};
  margin-top: 2px;
  position: absolute;
  right: 20px;

  &:hover {
    i {
      visibility: visible;
    }
  }

  i {
    visibility: hidden;
    margin-left: 6px;
    color: ${colors.colorCoreGray};
    text-decoration: none;

    &:hover {
      cursor: pointer;
    }
  }

  a {
    &:hover {
      cursor: pointer;
    }
  }
`;

const NameWrapper = styled.div`
  padding-top: 15px;

  a {
    &:hover {
      cursor: pointer;
    }
    i {
      &:hover {
        cursor: pointer;
      }
    }
  }
`;

const AboutWrapper = styled.div`
  margin-top: 25px;
`;

const CompanyWrapper = styled.div`
  border-top: 1px solid ${colors.borderPrimary};
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  width: 100%;

  span {
    display: inline-block;
    width: 100%;

    &:last-child {
      color: ${colors.colorCoreGray};
      font-weight: ${typography.fontWeightLight};
    }
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

const CompaniesWrapper = styled.div`
  i {
    color: #aaaeb3;

    &:hover {
      cursor: pointer;
    }
  }
`;

const ButtonWrapper = styled.div`
  button {
    float: right;
    margin-left: 5px;
  }
`;

export {
  AboutList,
  Aboutvalues,
  NameWrapper,
  AboutWrapper,
  CompaniesWrapper,
  CompanyWrapper,
  ButtonWrapper
};
