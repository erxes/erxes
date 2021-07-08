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
  font-weight: bold;

  #canvas {
    position: absolute;
    text-align: center;
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

  .trigger {
    cursor: pointer;
    position: absolute;
    top: 80px;
    left: 550px;
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

  .action-wrapper {
    height: 300px;
    position: absolute;
  }

  .action {
    position: absolute;
    left: 40px;
    bottom: 180px;
    height: 50px;
    cursor: pointer;
    border: 1px solid var(--slate-300);
    box-shadow: 0 4px 4px 0 rgb(0 0 0 / 13%);
    background: #FFF;
    font-size: 14px;
    border-radius: 5px;
    padding: 10px 20px;
  }

  #condition {
    top: 300px;
    left: 550px;
    width: 600px;

    .action {
      background-color: #4e5568;
      color: white;
    }

    .plus {
      left: 48%;
    }
  }

  .plus {
    position: absolute;
    top: 0px;
    width: 35px;
    height: 35px;
    border: 1px solid;
    border-radius: 50%;
    font-size: 20px;
  }

  .yes, .no {
    position: absolute;
    bottom: 0px;
    width: 55px;
    height: 55px;
    border: 1px solid;
    border-radius: 50%;
    font-size: 18px;
    padding: 10px;
  }

  .yes {
    left: 0px;
    border: 2px solid #19cca3
    color: #11866f;
  }

  .no {
    right: 0px;
    border: 2px solid #f3376b;
    color: #e40e49;
  }
`;

const plumb: any = jsPlumb;

class Form extends React.Component {
  componentDidMount() {
    const instance = plumb.getInstance({
      Container: 'canvas'
    });

    instance.bind('ready', () => {
      instance.connect({
        source: 'trigger1',
        target: 'plus1',
        anchors: ['BottomCenter', 'TopCenter'],
        endpoint: 'Blank'
      });

      instance.draggable('trigger1');
      instance.draggable('add-trigger');

      instance.connect({
        source: 'add-trigger',
        target: 'plus1',
        anchors: ['BottomCenter', 'TopCenter'],
        endpoint: 'Blank'
      });

      instance.connect({
        source: 'plus1',
        target: 'action-condition',
        anchors: ['BottomCenter', 'TopCenter'],
        endpoint: 'Blank',
        connector: 'Straight'
      });

      instance.connect({
        source: 'action-condition',
        target: 'condition-yes',
        anchors: ['BottomCenter', 'TopCenter'],
        endpoint: 'Blank'
      });

      instance.connect({
        source: 'action-condition',
        target: 'condition-no',
        anchors: ['BottomCenter', 'TopCenter'],
        endpoint: 'Blank'
      });

      jquery('.plus').click(event => {
        jquery(event.target).replaceWith('<div>test</div>');
      });
    });
  }

  render() {
    const content = (
      <Container>
        <div id="canvas">
          <h4>Start this automation when one of these actions takes place</h4>

          <div id="trigger1" className="trigger">
            Contact submits any form
          </div>
          <div id="add-trigger" className="trigger">
            Add a new trigger
          </div>

          <div className="action-wrapper" id="condition">
            <div id="plus1" className="plus">
              +
            </div>

            <div className="action" id="action-condition">
              Does the contact match the following conditions ? (has clicked any
              link)
            </div>

            <div className="yes" id="condition-yes">
              Yes
            </div>
            <div className="no" id="condition-no">
              No
            </div>
          </div>
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
