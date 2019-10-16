import dayjs from 'dayjs';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import { ItemDate } from 'modules/boards/styles/common';
import {
  Footer,
  Left,
  PriceContainer,
  Right
} from 'modules/boards/styles/item';
import { Content } from 'modules/boards/styles/stage';
import { IOptions } from 'modules/boards/types';
import { renderPriority } from 'modules/boards/utils';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import routerUtils from 'modules/common/utils/router';
import Participators from 'modules/inbox/components/conversationDetail/workarea/Participators';
import queryString from 'query-string';
import React from 'react';
import history from '../../../browserHistory';
import { ScoreAmount, Vote } from '../styles';
import { IGrowthHack } from '../types';
import Score from './Score';

type Props = {
  stageId: string;
  item: IGrowthHack;
  beforePopupClose: () => void;
  onClick: () => void;
  options: IOptions;
};

export default class GrowthHackItem extends React.PureComponent<
  Props,
  { isFormVisible: boolean }
> {
  unlisten?: () => void;

  constructor(props) {
    super(props);

    const { item } = props;

    const itemIdQueryParam = routerUtils.getParam(history, 'itemId');

    let isFormVisible = false;

    if (itemIdQueryParam === item._id || props.isPopupVisible) {
      isFormVisible = true;
    }

    this.state = {
      isFormVisible
    };
  }

  componentDidMount() {
    this.unlisten = history.listen(location => {
      const queryParams = queryString.parse(location.search);

      if (queryParams.itemId === this.props.item._id) {
        return this.setState({ isFormVisible: true });
      }
    });
  }

  componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten();
    }
  }

  renderDate(date) {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format('MMM D, h:mm a')}</ItemDate>;
  }

  renderForm = () => {
    const { stageId, item, options, beforePopupClose } = this.props;

    if (!this.state.isFormVisible) {
      return null;
    }

    const beforePopupCloseCb = () => {
      this.setState({ isFormVisible: false }, () => {
        const itemIdQueryParam = routerUtils.getParam(history, 'itemId');

        if (itemIdQueryParam) {
          routerUtils.removeParams(history, 'itemId');
        }

        beforePopupClose();
      });
    };

    return (
      <EditForm
        beforePopupClose={beforePopupCloseCb}
        options={options}
        stageId={stageId}
        itemId={item._id}
        hideHeader={true}
        isPopupVisible={this.state.isFormVisible}
      />
    );
  };

  render() {
    const { item, onClick } = this.props;
    const {
      scoringType,
      reach = 0,
      impact = 0,
      confidence = 0,
      ease = 0
    } = item;

    return (
      <>
        <Content onClick={onClick} type="growthHack">
          <h5>
            {renderPriority(item.priority)}
            {item.name}
          </h5>
          <ScoreAmount>
            <Score.Amount
              type={scoringType}
              r={reach}
              i={impact}
              c={confidence}
              e={ease}
            />
          </ScoreAmount>

          <PriceContainer>
            <Left>
              <Vote>
                <Icon icon="like-1" />
                {item.voteCount}
              </Vote>
            </Left>
            <Right>
              <Participators participatedUsers={item.assignedUsers} limit={3} />
            </Right>
          </PriceContainer>

          <Footer>
            {__('Last updated')}:
            <Right>{this.renderDate(item.modifiedAt)}</Right>
          </Footer>
        </Content>
        {this.renderForm()}
      </>
    );
  }
}
