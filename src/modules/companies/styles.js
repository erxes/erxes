import styled from 'styled-components';
import { colors } from '../common/styles';

const CustomerWrapper = styled.div`
  border-top: 1px solid ${colors.borderPrimary};
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  width: 100%;

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

export { CustomersWrapper, CustomerWrapper };
