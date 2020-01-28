import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const ModulRow = styled.div`
  display: flex;

  &:last-child {
    margin: 0;
  }
`;

const Greeting = styled.div`
  margin-bottom: 20px;
  font-size: 15px;

  span {
    margin-left: 5px;
  }

  p {
    margin-top: ${dimensions.unitSpacing}px;
    font-size: 14px;
  }
`;

const Bot = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px 0;
  text-align: center;

  &:hover {
    cursor: pointer;
  }

  img {
    width: 42px;
  }
`;

const Title = styled.h2`
  margin: 0 0 20px;
  font-size: 16px;
  text-transform: capitalize;
`;

const NavButton = styledTS<{ right?: boolean }>(styled.div)`
  margin-bottom: 10px;
  border-radius: 20px;
  display: inline-block;
  text-align: center;
  width: 28px;
  height: 28px;
  margin-left: ${props => !props.right && '-7px'};;
  margin-top: -5px;
  float: ${props => props.right && 'right'};
  background: ${props => props.right && colors.bgActive};
  position: sticky;
  top: 0;

  &:hover {
    background: ${props =>
      props.right ? colors.borderDarker : colors.bgActive};
    cursor: pointer;
  }

  i {
    line-height: 28px;
  }
`;

const Content = styled.div`
  position: fixed;
  padding: ${dimensions.coreSpacing}px;
  border-radius: 10px;
  background: ${colors.bgLight};
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 5px 15px 1px rgba(0, 0, 0, 0.15);
  bottom: 65px;
  left: 15px;
  max-height: calc(100% - 75px);
  overflow: auto;
  flex-direction: column;
`;

const SeeAll = styled.a`
  display: block;
  text-align: center;

  &:hover {
    cursor: pointer;
  }
`;

export { Bot, ModulRow, Greeting, Title, NavButton, Content, SeeAll };
