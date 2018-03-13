import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';
import {
  AboutList,
  Aboutvalues,
  NameWrapper
} from 'modules/customers/components/detail/sidebar/styles';

const List = AboutList.extend`
  li {
    padding: ${props => props.hover && `${dimensions.unitSpacing}px 0`};
    border-bottom: ${props =>
      props.hover && `1px solid ${colors.borderPrimary}`};

    > a {
      white-space: normal;
      display: block;
      padding: 0 20px;
      color: ${colors.textPrimary};

      span {
        color: ${colors.colorCoreLightGray};
      }
    }

    &:first-child {
      padding-top: ${props => props.hover && `${dimensions.unitSpacing}px`};
    }

    &:hover {
      background: ${props => props.hover && colors.bgLight};
    }
  }
`;

const Value = Aboutvalues.extend``;

const User = NameWrapper.extend`
  padding: ${dimensions.coreSpacing}px 0;
  justify-content: space-between;
`;

const Links = styled.div`
  a {
    color: ${colors.colorCoreLightGray};
    margin-right: 10px;

    &:hover {
      color: ${colors.colorCoreGray};
    }

    i {
      font-size: 14px;
    }
  }
`;

export { List, Value, User, Links };
