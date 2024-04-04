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
    padding: ${dimensions.unitSpacing}px 0 ${dimensions.coreSpacing * 1.5}px;
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
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const BoxHeader = styledTS<{ isOpen?: boolean; isSetup?: boolean }>(styled.div)`
  h4 {
    color: ${colors.colorPrimary};
    font-weight: 700;
    margin: ${dimensions.unitSpacing / 2}px 0;
  }
  color: ${colors.colorCoreGray};
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  ${props => !props.isSetup && `cursor: pointer;`}
  padding: 17px 30px;
  position: relative;
  ${props =>
    props.isOpen &&
    `
    border-bottom: 1px solid #F0F0F0;
    margin-bottom: 23px;

    &:before {
      content: "";
      background: ${colors.colorPrimary};
      width: 110px;
      height: 2px;
      position: absolute;
      left: 0px;
      bottom: 0px;
    }
  `}

  img {
    width: 50px;
    height: 50px;
    margin-right: 35px;
  }
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

const Card = styled.div`
  border-radius: ${dimensions.unitSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  margin: ${dimensions.coreSpacing}px 0;
  background: linear-gradient(
    0deg,
    #f883af -30.54%,
    #f47fb0 -18.64%,
    #e772b4 -4.1%,
    #d25dbb 9.12%,
    #b53fc4 22.34%,
    #941ece 35.56%,
    #2a1e81 99.02%
  );
  padding: ${dimensions.coreSpacing * 2}px;
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

  &:after {
    content: '';
    background: url('/images/astronaut.png') no-repeat;
    bottom: 0;
    right: -90px;
    width: 50%;
    height: 201px;
    position: absolute;
  }
`;

const LinkedButton = styled.a`
  color: black;
  width: 100%;
  display: flex;
  margin-bottom: 20px;
  align-items: center;

  &:last-child {
    margin-bottom: 0px;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    color: #444;
    transition: all ease 0.3s;
    margin: 0;
  }

  > div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 12px;

    span {
      color: #888;
    }

    h3 {
      font-size: 14px;
    }
  }

  > i {
    margin-right: 30px;
    height: 40px;
    padding: 10px;
    background: ${colors.colorWhite};
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    border-radius: 7px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const BoxContent = styled.div`
  padding: 0 30px 25px;

  h5 {
    color: #888;
    font-size: 13px;
    margin-top: 0;
  }

  .dropdown {
    width: 100%;
    a {
      margin-bottom: 20px;
    }
  }
  .dropdown-menu {
    padding: 6px 6px 0;
  }
`;

const VideoLink = styled.button`
  display: flex;
  margin-left: auto;
  background: ${colors.colorPrimary};
  border-radius: 7px;
  padding: 7px 12px;
  justify-content: center;
  align-items: center;
  color: ${colors.colorWhite};
  height: 40px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  font-size: 12px;
  height: 30px;

  i {
    background: none;
    padding: 0;
    margin-right: 0;
    margin-left: 5px;
  }
`;

const Setup = styled.div`
  border-top: 1px solid #f0f0f0;
  padding: 0 30px;

  > a {
    margin-bottom: 0;
    padding: 12px 0;

    button {
      margin-left: auto;
      display: flex;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      justify-content: center;
      align-items: center;
    }
  }
`;

const SetupContent = styled.div`
  margin-left: 50px;
  padding-bottom: ${dimensions.coreSpacing}px;

  > button {
    margin-left: auto;
    display: flex;
    font-size: 12px;
  }

  ul {
    padding-inline-start: 15px;
  }

  ol {
    margin-top: 0;
    font-size: 14px;
    line-height: 28px;
  }
`;

const VideoFrame = styled.div`
  width: 100%;
`;

export {
  BoxedStep,
  BoxHeader,
  Left,
  Boxes,
  Header,
  LinkedButton,
  BoxContent,
  VideoLink,
  Setup,
  SetupContent,
  Card,
  VideoFrame
};
