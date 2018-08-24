import styled from 'styled-components';
import { colors } from 'modules/common/styles';

const IntegrationWrapper = styled.div`
  padding-bottom: 40px;

  h3 {
    margin: 40px 40px -10px 40px;
  }
`;

const IntegrationRow = styled.div`
  padding-right: 40px;
  display: flex;
`;

const Box = styled.div`
  padding: 30px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 2px;
  flex: 1;
  transition: all ease 0.3s;

  &:hover {
    cursor: pointer;
    border-color: ${colors.colorCoreTeal};
  }
`;

const IntegrationItem = styled.div`
  width: 33.333333333%;
  display: flex;
  padding-left: 40px;
  padding-top: 40px;
  position: relative;

  img {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }

  h5 {
    margin-top: 20px;

    span {
      font-size: 80%;
      color: ${colors.colorCoreGray};
    }
  }

  p {
    margin: 0;
  }

  &.active {
    ${Box} {
      border-color: ${colors.colorCoreTeal};
    }

    &::before {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -10px;
      border-left: 20px solid transparent;
      border-right: 20px solid transparent;
      border-bottom: 20px solid #f8f8f8;
    }
  }
`;

const CollapsibleContent = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #f8f8f8;
  transition: height ease 0.3s;
`;

export {
  IntegrationWrapper,
  IntegrationRow,
  IntegrationItem,
  CollapsibleContent,
  Box
};
