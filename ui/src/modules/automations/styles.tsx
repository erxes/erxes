import styled from 'styled-components';

export const Container = styled.div`
  background-color: #f8f9ff;
  width: 100%;
  height: 100%;

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
    color: #ffff;
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
