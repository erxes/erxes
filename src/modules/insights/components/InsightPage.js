import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { BoxRoot, FullContent } from 'modules/common/styles/styles';
import { colors } from 'modules/common/styles';

const boxSize = 320;

const Box = BoxRoot.extend`
  width: ${boxSize}px;
  display: flex;
  align-items: center;

  > a {
    padding: 40px;
  }

  &:last-of-type {
    margin-right: 0;
  }

  span {
    font-weight: 500;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
  }
`;

class InsightPage extends React.Component {
  renderBox(name, image, to, desc) {
    const { __ } = this.context;
    return (
      <Box>
        <Link to={to}>
          <img src={image} alt={name} />
          <span>{__(name)}</span>
          <p>{__(desc)}</p>
        </Link>
      </Box>
    );
  }

  render() {
    const { __ } = this.context;
    const breadcrumb = [{ title: __('Insights'), link: '/insights' }];

    const content = (
      <FullContent center>
        <div>
          <div>
            {this.renderBox(
              'Volume Report',
              '/images/icons/erxes-14.svg',
              '/insights/volume-report',
              'Feedbacks gathered through various customer engagement channels.'
            )}
            {this.renderBox(
              'Response Report',
              '/images/icons/erxes-15.svg',
              '/insights/response-report',
              'Total number of response for customer feedbacks, by each staff.'
            )}
          </div>
          <div>
            {this.renderBox(
              'Response Close Report',
              '/images/icons/erxes-17.svg',
              '/insights/response-close-report',
              'Average time of each staff solving problems that based on customer feedbacks.'
            )}
            {this.renderBox(
              'First Response Report',
              '/images/icons/erxes-16.svg',
              '/insights/first-response',
              'Responding time for a single feedback. Stats will define average response time by each staff.'
            )}
          </div>
        </div>
      </FullContent>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
        transparent={true}
      />
    );
  }
}

InsightPage.contextTypes = {
  __: PropTypes.func
};

export default InsightPage;
