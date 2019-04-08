import { colors } from 'modules/common/styles';
import { FullContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Box } from '../styles';

class InsightPage extends React.Component {
  renderBox(name, image, to, desc) {
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
    const breadcrumb = [{ title: __('Insights'), link: '/insights' }];

    const content = (
      <FullContent center={true}>
        <div>
          <div>
            {this.renderBox(
              'Volume Report',
              '/images/icons/erxes-14.svg',
              '/insights/volume-report',
              'Find feedback that has been gathered from various customer engagement channels.'
            )}
            {this.renderBox(
              'Response Report',
              '/images/icons/erxes-15.svg',
              '/insights/response-report',
              'A report on the total number of customer feedback responses given by team members.'
            )}
          </div>
          <div>
            {this.renderBox(
              'Response Close Report',
              '/images/icons/erxes-17.svg',
              '/insights/response-close-report',
              `The average time a team member solved a problem based on customer feedback.`
            )}
            {this.renderBox(
              'First Response Report',
              '/images/icons/erxes-16.svg',
              '/insights/first-response',
              'You can find stats that defines the average response time by each team member.'
            )}
          </div>
        </div>
      </FullContent>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} submenu={menuInbox} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default InsightPage;
