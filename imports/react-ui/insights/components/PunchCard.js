import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';

import Sidebar from './Sidebar';
import Filter from './Filter';

const propTypes = {
  data: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
};

class PunchCard extends React.Component {
  render() {
    const { data, brands } = this.props;
    const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const times = [
      '12a',
      '1a',
      '2a',
      '3a',
      '4a',
      '5a',
      '6a',
      '7a',
      '8a',
      '9a',
      '10a',
      '11a',
      '12p',
      '1p',
      '2p',
      '3p',
      '4p',
      '5p',
      '6p',
      '7p',
      '8p',
      '9p',
      '10p',
      '11p',
    ];

    const eachVal = (array, max) => {
      return (
        <td width="85%">
          {array.map(val =>
            <div key={Math.random()} className="punch-val">
              <div
                className="punch-bar"
                style={{ height: `${max === 0 ? 0 : val * 100 / max}%` }}
              />
            </div>,
          )}
        </td>
      );
    };

    const content = (
      <div className="insight-wrapper">
        <Filter brands={brands} hideStartDate={true} />
        <div className="punch-card margined">
          <table className="table">
            <tbody>
              {data.map(detail =>
                <tr key={Math.random()}>
                  <td width="15%">
                    <b>
                      {weekday[detail.day]}
                    </b>
                  </td>
                  {eachVal(detail.value, detail.maxValue)}
                </tr>,
              )}
              <tr>
                <td width="15%" />
                <td width="85%">
                  {data[0].value.map((val, index) =>
                    <div key={Math.random()}>
                      <b>
                        {times[index]}
                      </b>
                    </div>,
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={[{ title: 'Punch card' }]} />}
          leftSidebar={<Sidebar />}
          content={content}
        />
      </div>
    );
  }
}

PunchCard.propTypes = propTypes;

export default PunchCard;
