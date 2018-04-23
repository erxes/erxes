import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'modules/common/components';
import Condition from './Condition';

const propTypes = {
  conditions: PropTypes.array.isRequired,
  changeCondition: PropTypes.func.isRequired,
  removeCondition: PropTypes.func.isRequired,
  parentSegmentId: PropTypes.string,
  contentType: PropTypes.string
};

const contextTypes = {
  __: PropTypes.func
};

function Conditions(
  {
    conditions,
    changeCondition,
    removeCondition,
    contentType,
    parentSegmentId
  },
  { __ }
) {
  const parent = () => {
    if (parentSegmentId) {
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

    return null;
  };

  return (
    <Fragment>
      {parent()}
      {conditions.map(condition => (
        <Condition
          condition={condition}
          changeCondition={changeCondition}
          removeCondition={removeCondition}
          key={condition.field}
        />
      ))}
    </Fragment>
  );
}

Conditions.propTypes = propTypes;
Conditions.contextTypes = contextTypes;

export default Conditions;
