import { __ } from 'modules/common/utils';
import { jsPlumb } from 'jsplumb';
import jquery from 'jquery';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
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

  .automation-description {
    text-align: center;
    font-weight: bold;
  }

  #triggers-wrapper {
    position: relative;
    width: 100%;
    text-align: center;
  }

  .trigger {
    display: inline-block;
    cursor: pointer;
    width: 220px;
    padding: 16px;
    margin-left: 20px;
    border: 1px solid var(--slate-300);
    box-shadow: 0 4px 4px 0 rgb(0 0 0 / 13%);
    background: #FFF;
    font-size: 14px;
    color: var(--slate-600);
    text-decoration: none;
    border-radius: 5px;
  }

  #add-trigger {
    border-style: dotted;
    left: 900px;
  }

  #actions-wrapper {
    position: relative;
  }

  .divider {
    display: block;
    text-align: center;
    margin-top: 50px;
    margin-bottom: 50px;
  }

  .action {
    display: inline-block;
    height: 50px;
    cursor: pointer;
  }

  .action .description {
    border: 1px solid var(--slate-300);
    box-shadow: 0 4px 4px 0 rgb(0 0 0 / 13%);
    background: #FFF;
    font-size: 14px;
    border-radius: 5px;
    padding: 10px 20px;
    margin-top: 40px;
    margin-bottom: 40px;
    color: white;
  }

  .action .plus {
    margin: 0 auto;
  }

  .action .description[type="ADD_TAGS"] {
    background: #60cb98;
  }

  .action .description[type="ADD_CONTACT"] {
    background: #db5d80;
  }

  .action .description[type="REMOVE_TAGS"] {
    background: #4e5568;
  }

  .action .description[type="IF"] {
    background: #4a9ccd;
    margin-bottom: 100px;
  }

  .plus {
    width: 35px;
    height: 35px;
    border: 1px solid;
    border-radius: 50%;
    font-size: 20px;
    text-align: center;
  }

  #main-plus {
    position: relative;
    left: 50%;
    margin-top: 100px;
  }

  .action-if .plus {
    margin-top: 50px;
  }

  .yes, .no {
    width: 45px;
    height: 45px;
    border: 1px solid;
    border-radius: 50%;
    font-size: 13px;
    padding: 10px;
  }

  .yes {
    border: 2px solid #19cca3
    color: #11866f;
  }

  .no {
    border: 2px solid #f3376b;
    color: #e40e49;
  }
`;

const plumb: any = jsPlumb;
let instance;

const trigger = {
  name: 'formSubmit',
  text: 'Contact submits any form'
};

const actionsMap = {
  '1': {
    id: '1',
    type: 'ADD_TAGS',
    text: 'Enter the automation',
    nextActionId: '2'
  },
  '2': {
    id: '2',
    prevActionId: '1',
    text:
      'Does the contact match the following conditions ? (has clicked any link)',
    type: 'IF',
    data: {
      yes: '3',
      no: '5'
    }
  },
  '3': {
    id: '3',
    prevActionId: '2',
    text: 'Create contact',
    type: 'ADD_CONTACT',
    nextActionId: '4'
  },
  '4': {
    id: '4',
    prevActionId: '3',
    text: 'Add task Call',
    type: 'REMOVE_TAGS'
  },
  '5': {
    id: '5',
    prevActionId: '2',
    text: 'Add task Call',
    type: 'REMOVE_TAGS'
  }
};

const drawActions = (sourceElement, currentActionId) => {
  if (!currentActionId) {
    return;
  }

  const action = actionsMap[currentActionId];

  const description = `
    <div class="description" id="action-description-${action.id}" type="${action.type}">
      ${action.text}
    </div>
  `;

  if (action.type === 'IF') {
    jquery(`
      <div class="divider">
        <div id="action-${action.id}" class="action action-if">
          ${description}

          <div style="float:left">
            <div class="yes" id="yes-${action.id}">Yes</div>

            <div class="plus" id="yes-plus-${action.id}">+</div>
          </div>

          <div style="float:right">
            <div class="no" id="no-${action.id}">No</div>
            <div class="plus" id="no-plus-${action.id}">+</div>
          </div>
        </div>
      </div>
    `).insertAfter(sourceElement);

    if (action.prevActionId) {
      instance.connect({
        source: `plus-${action.prevActionId}`,
        target: `action-description-${action.id}`,
        anchors: ['BottomCenter', 'TopCenter'],
        connector: 'Straight',
        endpoint: 'Blank'
      });
    }

    instance.connect({
      source: `action-description-${action.id}`,
      target: `yes-${action.id}`,
      anchors: ['BottomCenter', 'TopCenter'],
      endpoint: 'Blank'
    });

    instance.connect({
      source: `action-description-${action.id}`,
      target: `no-${action.id}`,
      anchors: ['BottomCenter', 'TopCenter'],
      endpoint: 'Blank'
    });

    instance.connect({
      source: `yes-${action.id}`,
      target: `yes-plus-${action.id}`,
      anchors: ['BottomCenter', 'TopCenter'],
      connector: 'Straight',
      endpoint: 'Blank'
    });

    instance.connect({
      source: `no-${action.id}`,
      target: `no-plus-${action.id}`,
      anchors: ['BottomCenter', 'TopCenter'],
      connector: 'Straight',
      endpoint: 'Blank'
    });

    if (action.data) {
      if (action.data.yes) {
        drawActions(jquery(`#yes-plus-${action.id}`), action.data.yes);
      }

      if (action.data.no) {
        drawActions(jquery(`#no-plus-${action.id}`), action.data.no);
      }
    }

    return null;
  }

  jquery(`
    <div class="divider">
      <div id="action-${action.id}" class="action">
        ${description}
        <div class="plus" id="plus-${action.id}">+</div>
      </div>
    </div>
  `).insertAfter(sourceElement);

  if (action.prevActionId) {
    instance.connect({
      source: `plus-${action.prevActionId}`,
      target: `action-description-${action.id}`,
      anchors: ['BottomCenter', 'TopCenter'],
      connector: 'Straight',
      endpoint: 'Blank'
    });
  }

  instance.connect({
    source: `action-description-${action.id}`,
    target: `plus-${action.id}`,
    anchors: ['BottomCenter', 'TopCenter'],
    connector: 'Straight',
    endpoint: 'Blank'
  });

  if (!action.prevActionId) {
    instance.connect({
      source: `main-plus`,
      target: `action-description-${action.id}`,
      anchors: ['BottomCenter', 'TopCenter'],
      connector: 'Straight',
      endpoint: 'Blank'
    });
  }

  return drawActions(jquery(`#plus-${action.id}`), action.nextActionId);
};

class Form extends React.Component {
  componentDidMount() {
    instance = plumb.getInstance({
      Container: 'canvas'
    });
    // Add triggers to dom ==========
    jquery('#triggers-wrapper').append(`
      <div id="add-trigger" class="trigger">
        Add a new trigger
      </div>
    `);

    jquery(`
      <div id="trigger-${trigger.name}" class="trigger">
        ${trigger.text}
      </div>
    `).insertBefore('#add-trigger');

    // Add actions to dom ===============
    drawActions(jquery('#main-plus'), '1');

    instance.bind('ready', () => {
      instance.connect({
        source: `trigger-${trigger.name}`,
        target: 'main-plus',
        anchors: ['BottomCenter', 'TopCenter'],
        connector: 'Straight',
        endpoint: 'Blank'
      });

      instance.connect({
        source: 'add-trigger',
        target: 'main-plus',
        anchors: ['BottomCenter', 'TopCenter'],
        connector: 'Straight',
        endpoint: 'Blank'
      });
    });
  }

  render() {
    const content = (
      <Container>
        <h4 className="automation-description">
          Start this automation when one of these actions takes place
        </h4>

        <div id="canvas">
          <div id="triggers-wrapper" />

          <div id="main-plus" className="plus">
            +
          </div>

          <div id="actions-wrapper" />
        </div>
      </Container>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${'Automations' || ''}`}
            breadcrumb={[{ title: __('Automations'), link: '/automations' }]}
          />
        }
        content={content}
      />
    );
  }
}

export default Form;
