import styled from 'styled-components';
import colors from 'modules/common/styles/colors';
import { dimensions } from 'erxes-ui/lib/styles/eindex';

export const Container = styled.div`
  padding: ${dimensions.coreSpacing}px;

  #canvas {
    position: relative;
    font-weight: bold;
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

export const TriggerBox = styled.div`
  background: ${colors.colorWhite};
  border-radius: 2px;
  border: 1px solid ${colors.borderPrimary};
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
