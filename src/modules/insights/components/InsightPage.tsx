import { FullContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { menuDeal, menuInbox } from 'modules/common/utils/menus';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { DEAL_INSIGHTS, INBOX_INSIGHTS, INSIGHT_TYPES } from '../constants';
import { Box, BoxContainer } from '../styles';
import { IInsightType } from '../types';

type Props = {
  type: string;
};

class InsightPage extends React.Component<Props> {
  getInsights() {
    const { type = INSIGHT_TYPES.INBOX } = this.props;

    return type === INSIGHT_TYPES.INBOX ? INBOX_INSIGHTS : DEAL_INSIGHTS;
  }

  renderBox(insight: IInsightType) {
    const { name, image, to, desc } = insight;

    return (
      <Box key={to}>
        <Link to={to}>
          <img src={image} alt={name} />
          <span>{__(name)}</span>
          <p>{__(desc)}</p>
        </Link>
      </Box>
    );
  }

  render() {
    const { type } = this.props;

    const breadcrumb = [{ title: __('Insights'), link: `/${type}/insights` }];

    const content = (
      <FullContent center={true}>
        <BoxContainer>
          {this.getInsights().map(insight => this.renderBox(insight))}
        </BoxContainer>
      </FullContent>
    );

    const submenu = type === INSIGHT_TYPES.INBOX ? menuInbox : menuDeal;

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} submenu={submenu} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default InsightPage;
