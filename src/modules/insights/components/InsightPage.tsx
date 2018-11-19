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
        header={<Wrapper.Header breadcrumb={breadcrumb} submenu={menuInbox} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default InsightPage;
