import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'modules/common/components';
import Condition from './Condition';

const propTypes = {
  fields: PropTypes.array.isRequired,
  conditions: PropTypes.array.isRequired,
  changeCondition: PropTypes.func.isRequired,
  removeCondition: PropTypes.func.isRequired,
  parentSegmentId: PropTypes.string,
  contentType: PropTypes.string
};

const contextTypes = {
  __: PropTypes.func
};

class Conditions extends Component {
  renderParent() {
    const { contentType, parentSegmentId } = this.props;
    const { __ } = this.context;

    if (!parentSegmentId) return null;

    return (
      <Fragment>
        <Link
          to={`/segments/edit/${contentType}/${parentSegmentId}`}
          target="_blank"
        >
          <Button icon="eye" ignoreTrans>
            {__('Parent segment conditions')}
          </Button>
        </Link>
        <hr />
      </Fragment>
    );
  }

  render() {
    const { fields, conditions, changeCondition, removeCondition } = this.props;

    return (
      <Fragment>
        {this.renderParent()}
        {conditions.map(condition => (
          <Condition
            fields={fields}
            condition={condition}
            changeCondition={changeCondition}
            removeCondition={removeCondition}
            key={condition.field}
          />
        ))}
      </Fragment>
    );
  }
}

Conditions.propTypes = propTypes;
Conditions.contextTypes = contextTypes;

export default Conditions;
