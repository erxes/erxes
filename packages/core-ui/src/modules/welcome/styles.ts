import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { SectionContainer } from '@erxes/ui/src/layout/styles';

const Header = styled.div`
  h1 {
    margin: 20px 0 5px;
    font-size: 28px;
    font-weight: 900;
  }

  > div {
    margin: 0;
    font-size: 14px;
    padding: ${dimensions.coreSpacing}px 0;
    color: ${colors.colorCoreGray};

    ul {
      padding-inline-start: 15px;
    }
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const BoxedStep = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const BoxHeader = styled.div`
  h4 {
    color: ${colors.colorPrimary};
    font-weight: 700;
    margin: ${dimensions.unitSpacing / 2}px 0;
  }
  color: ${colors.colorCoreGray};
  align-items: center;
  margin: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px
    ${dimensions.coreSpacing}px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Boxes = styled.div`
  width: 50%;
  position: relative;
  h3 {
    border-bottom: none;
  }
  &:first-child {
    padding: 0 ${dimensions.unitSpacing}px;
  }
  &:last-child {
    padding: 0 ${dimensions.unitSpacing}px 0 0;
  }
  ${SectionContainer} {
    border-top: 1px solid ${colors.borderPrimary};
    padding-top: ${dimensions.unitSpacing / 2}px;
    box-shadow: none;
    border-bottom: none;
    h3 {
      text-transform: capitalize;
    }
  }
`;

const Card = styledTS<{ background: string; img: string }>(styled.div)`
  border-radius: ${dimensions.unitSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  margin: ${dimensions.coreSpacing}px 0;
  background: ${props => props.background};
  padding: ${dimensions.coreSpacing * 2}px ${dimensions.coreSpacing * 2}px;
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  
  h4 {
    margin: 0 0 10px;
    font-weight: 700;
  }
  p {
    max-width: 400px;
  }

  &:before {
    content: "";
    background: url("${props => props.img}") no-repeat;
    bottom: 0;
    right: ${props =>
      props.img === '/images/shootingStars.png' ? '0' : '-90px'};
    width: 50%;
    height: 201px;
    position: absolute;
  }
`;

const SideNumber = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  text-align: center;
  position: relative;

  h3 {
    margin-bottom: 0;
    font-size: 42px;
    font-weight: 900;
  }

  &:before {
    content: '';
    position: absolute;
    width: 196px;
    height: 196px;
    left: -26px;
    top: -52px;
    border-radius: 50%;
    background: linear-gradient(
      211.46deg,
      #a96bfe 14.09%,
      rgba(120, 23, 254, 0) 31.12%
    );
    transform: rotate(-180deg);
  }
  &:after {
    content: '';
    position: absolute;
    width: 196px;
    height: 196px;
    left: -36px;
    top: -34px;
    border-radius: 50%;
    background: linear-gradient(
      211.46deg,
      #a96bfe 14.09%,
      rgba(120, 23, 254, 0) 31.12%
    );
  }
`;

const LinkedButton = styled.a`
  color: black;
  width: 100%;

  h3 {
    border-top: 1px solid #eee;
    padding: 0 20px;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    padding-top: 18px;
    cursor: pointer;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.colorSecondary};
    }
  }
`;

export {
  BoxedStep,
  BoxHeader,
  Left,
  Boxes,
  Card,
  Header,
  SideNumber,
  LinkedButton
};
