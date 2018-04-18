import React from 'react';
import PropTypes from 'prop-types';
import { Label, Icon } from 'modules/common/components';
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
  return (
    <div>
      {parentSegmentId ? (
        <a
          href={`/segments/edit/${contentType}/${parentSegmentId}`}
          target="_blank"
        >
          <h4>
            <Label ignoreTrans>
              {__('Parent segment conditions')} <Icon erxes icon="logout-2" />
            </Label>
          </h4>
          <br />
        </a>
      ) : null}
      {conditions.map(condition => (
        <Condition
          condition={condition}
          changeCondition={changeCondition}
          removeCondition={removeCondition}
          key={condition.field}
        />
      ))}
    </div>
  );
}

Conditions.propTypes = propTypes;
Conditions.contextTypes = contextTypes;

export default Conditions;
