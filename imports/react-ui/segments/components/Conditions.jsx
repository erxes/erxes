import React, { PropTypes } from 'react';
import Condition from './Condition.jsx';

const propTypes = {
  conditions: PropTypes.array.isRequired,
  changeCondition: PropTypes.func.isRequired,
  removeCondition: PropTypes.func.isRequired,
};

function Conditions({ conditions, changeCondition, removeCondition }) {
  return (
    <div>
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

export default Conditions;
