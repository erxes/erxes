import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const BlockValue = styled.div`
  font-size: 12px;
  color: ${colors.colorCoreGray};
  margin-top: 5px;
  white-space: normal;
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

const ButtonWrapper = styled.div`
  text-align: right;
`;

export { BlockValue, CompanyWrapper, ButtonWrapper };
