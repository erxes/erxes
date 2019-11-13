import TextInfo from 'modules/common/components/TextInfo';
import { __ } from 'modules/common/utils';
import React from 'react';
import Col from 'react-bootstrap-latest/Col';
import Row from 'react-bootstrap-latest/Row';
import { ILog } from '../types';

type Props = {
  log: ILog;
};

export default class LogModal extends React.Component<Props> {
  /**
   * Reads a stringified json and builds a list using its attributes.
   * @param {string} jsonString A stringified JSON object
   */
  prettyJSON(jsonString?: string) {
    const list: JSX.Element[] = [];

    if (jsonString) {
      const clean = jsonString.replace('\n', '');
      const parsed = JSON.parse(clean);
      const names = Object.getOwnPropertyNames(parsed);

      for (const name of names) {
        // exclude __v & _id fields
        if (!(name === '__v' || name === '_id')) {
          let item = <li key={name}>{`${name} : ${parsed[name]}`}</li>;

          if (typeof parsed[name] === 'object') {
            item = (
              <li key={name}>{`${name} : ${JSON.stringify(parsed[name])}`}</li>
            );
          }

          list.push(item);
        }
      } // end for loop
    }

    return <ul>{list}</ul>;
  }

  renderLeftSide(log) {
    let label = '';

    switch (log.action) {
      case 'create':
        return null;
      case 'update':
        label = __('Unchanged fields');
        break;
      case 'delete':
        label = __('Old data');
        break;
      default:
        break;
    }

    return (
      <Col sm={6}>
        <TextInfo textStyle="warning" hugeness="big">
          {label}
        </TextInfo>
        {this.prettyJSON(log.oldData)}
      </Col>
    );
  }

  renderRightSide(log) {
    let label = '';

    switch (log.action) {
      case 'create':
        label = __('New data');
        break;
      case 'update':
        label = __('Changed fields');
        break;
      case 'delete':
        return null;
      default:
        break;
    }

    return (
      <Col sm={6}>
        <TextInfo textStyle="success" hugeness="big">
          {label}
        </TextInfo>
        {this.prettyJSON(log.newData)}
      </Col>
    );
  }

  render() {
    const { log } = this.props;

    return (
      <Row>
        {this.renderLeftSide(log)}
        {this.renderRightSide(log)}
      </Row>
    );
  }
}
