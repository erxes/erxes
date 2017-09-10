import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  data: PropTypes.array.isRequired,
};

class Summary extends React.Component {
  renderSummary(sum) {
    return (
      <div className="col-sm-3" key={Math.random()}>
        <div className="summary-item">
          <div className="summary-title">
            {sum.title}
          </div>
          <span className="summary-count">
            {sum.count}
          </span>
        </div>
      </div>
    );
  }

  render() {
    const { data } = this.props;
    return (
      <div>
        {data.map(detail => this.renderSummary(detail))}
      </div>
    );
  }
}

Summary.propTypes = propTypes;

export default Summary;
