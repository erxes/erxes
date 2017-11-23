import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';
import { typography } from 'modules/common/styles';

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

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      padding-bottom: ${dimensions.unitSpacing}px;
    }
  }

  > span {
    font-size: 12px;
    text-align: right;
    color: #888;
    margin-top: 2px;
    position: absolute;
    right: ${dimensions.coreSpacing}px;
  }
`;

const Aboutvalues = styled.span`
  font-size: 12px;
  text-align: right;
  color: ${colors.colorCoreGray};
  margin-top: 2px;
  position: absolute;
  right: ${dimensions.coreSpacing}px;

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
  padding-top: ${dimensions.coreSpacing}px;
  display: flex;
  flex-direction: row;
  align-items: center;

  .cutomer-name {
    flex: 1;
  }

  a {
    cursor: pointer;
  }
`;

const AboutWrapper = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
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
  CompanyWrapper,
  ButtonWrapper
};
