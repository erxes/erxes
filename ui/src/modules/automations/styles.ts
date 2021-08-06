import styled from 'styled-components';
import colors from 'modules/common/styles/colors';
import { dimensions } from 'erxes-ui/lib/styles/eindex';
import styledTS from 'styled-components-ts';

export const Container = styled.div`
  padding: ${dimensions.coreSpacing}px;

  #canvas {
    position: relative;
    font-weight: bold;

    .custom-menu {
      z-index: 1000;
      position: absolute;
    }

    path,
    .jtk-endpoint {
      cursor: pointer;
    }
  }

  .jtk-connector {
    z-index: 4;
  }

  .jtk-endpoint {
    z-index: 5;
  }

  .jtk-overlay {
    z-index: 6;
  }

  .trigger,
  .action {
    width: 100px;
    height: 100px;
    line-height: 100px;
    position: absolute;
    border: 1px solid;
    border-radius: 20px;
    text-align: center;
    cursor: pointer;
    margin-bottom: 50px;
    color: ${colors.colorWhite};
  }

  .trigger {
    color: black;
  }

  .action {
    background: #60cb98;
  }

  .action[type='if'] {
    background: #4a7cb8;
  }

  .action[type='goto'] {
    background: #ed8d50;
  }

  .action[type='performMath'] {
    background: #ed0d50;
  }

  .action[type='createTicket'] {
    background: #60cb98;
  }

  .action[type='createTask'] {
    background: #db5d80;
  }

  .action[type='createDeal'] {
    background: #60cb98;
  }
`;

export const TriggerBox = styledTS<{ selected?: boolean }>(styled.div)`
  background: ${colors.colorWhite};
  border-radius: 2px;
  border: ${props =>
    props.selected
      ? `2px solid ${colors.colorPrimary}`
      : `1px solid ${colors.borderPrimary}`};
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: ${dimensions.coreSpacing}px;
  padding: ${dimensions.unitSpacing}px;
  cursor: pointer;
  text-transform: capitalize;
  color: ${colors.colorCoreGray};
  transition: all ease 0.3s;

  > i {
    color: ${colors.colorSecondary};
  }

  &:hover {
    box-shadow: 0 6px 10px 1px rgba(136, 136, 136, 0.12);
  }
`;

export const ActionBox = styled(TriggerBox)`
  flex-direction: row;
  margin-bottom: ${dimensions.unitSpacing}px;

  > i {
    margin-right: ${dimensions.unitSpacing}px;
  }

  > div {
    p {
      margin: 0;
    }
  }
`;

export const ConditionContaier = styled.div`
  padding: ${dimensions.coreSpacing}px;
  transition: all ease 0.5s;
  background: ${colors.bgGray};
  border-radius: 8px;
  .dropdown {
    display: none;
  }
`;

export const CenterFlexRow = styled.div`
  display: flex;
  align-items: center;
`;

export const Title = styled(CenterFlexRow)`
  transition: all ease 0.3s;
  padding: 0 ${dimensions.unitSpacing}px;
  border-radius: 4px;

  input {
    border: 0;
    font-size: 16px;
  }

  i {
    visibility: hidden;
  }

  &:hover {
    background: ${colors.bgActive};

    i {
      visibility: visible;
    }
  }
`;

export const BackButton = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 35px;
  line-height: 35px;
  background: rgba(0, 0, 0, 0.12);
  text-align: center;
  margin-right: ${dimensions.unitSpacing}px;
`;

export const TypeBox = styled(CenterFlexRow)`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 8px;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  margin-top: ${dimensions.unitSpacing}px;
  transition: all ease 0.3s;
  cursor: pointer;

  > img {
    width: 80px;
    margin-right: ${dimensions.unitSpacing}px;
  }

  > div {
    margin: 0;
  }

  &:hover {
    border-color: ${colors.colorSecondary};
    box-shadow: 0px 8px 20px rgba(79, 51, 175, 0.24),
      0px 2px 6px rgba(79, 51, 175, 0.16), 0px 0px 1px rgba(79, 51, 175, 0.08);
  }
`;
