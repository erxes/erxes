import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Condition from './Condition';

const propTypes = {
  conditions: PropTypes.array.isRequired,
  changeCondition: PropTypes.func.isRequired,
  removeCondition: PropTypes.func.isRequired,
  parentSegmentId: PropTypes.string,
};

function Conditions({ conditions, changeCondition, removeCondition, parentSegmentId }) {
  return (
    <div>
      {parentSegmentId
        ? <a href={FlowRouter.path('segments/edit', { id: parentSegmentId })} target="_blank">
            <h4>
              <Label>
                Parent segment conditions <i className="ion-android-open" />
              </Label>
            </h4>
            <br />
          </a>
        : null}
      {conditions.map(condition =>
        <Condition
          condition={condition}
          changeCondition={changeCondition}
          removeCondition={removeCondition}
          key={condition.field}
        />,
      )}
    </div>
  );
}

Conditions.propTypes = propTypes;

export default Conditions;
