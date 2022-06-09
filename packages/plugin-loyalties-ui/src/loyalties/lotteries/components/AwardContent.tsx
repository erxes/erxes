import {
  Alert,
  Button,
  FormControl,
  ModalTrigger,
  Wrapper
} from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { AwardContainer, Card } from '../../../styles';
import AwardList from './award list';

type State = {
  multiple: number;
  isOpenNextChar: boolean;
  isOpenInput: boolean;
};

interface IProps extends IRouterProps {
  loading: boolean;
  queryParams: any;
  currentTab: any;
  doLotteries: (variable: object) => any;
  multipledoLottery: (variable: object) => any;
  getNextChar: (variable: object) => any;
  winners: any;
  winnersTotalCount: number;
  list: any;
  totalCount: number;
  lotteryCampaign: any;
  nextChar: any;
}

class AwardContentComponent extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = { multiple: 0, isOpenNextChar: false, isOpenInput: false };
  }

  render() {
    const {
      currentTab,
      doLotteries,
      winners,
      list,
      totalCount,
      winnersTotalCount,
      lotteryCampaign,
      multipledoLottery,
      nextChar
    } = this.props;
    const { multiple, isOpenNextChar, isOpenInput } = this.state;

    const lotterydetailbtn = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Detail
      </Button>
    );
    const LotteryCampaignDetail = () => {
      return (
        <div>
          <p>shit</p>
        </div>
      );
    };
    const actionbarLotteryRight = () => {
      return (
        <ModalTrigger
          title="Lottery Detail"
          trigger={lotterydetailbtn}
          autoOpenKey="showLotteryModal"
          content={LotteryCampaignDetail}
          backDrop="static"
        />
      );
    };
    const List = (data: any, isWinnerList: boolean) => {
      const updatedProps = {
        //   loading: this.props.loading,
        lotteries: data,
        totalCount: totalCount,
        isWinnerList
      };

      return <AwardList {...updatedProps} />;
    };
    const NextChar = () => {
      const numberFormat = lotteryCampaign.numberFormat
        .match(/ \* [0-9]* /g)[0]
        .substring(3);

      return (
        <div style={{ display: 'flex', flex: 'row' }}>
          {Array.from(Array(parseInt(numberFormat)), (e, i) => {
            return <Card key={i}>{nextChar.charAt(i) || ''}</Card>;
          })}
        </div>
      );
    };
    const doLottery = () => {
      const { campaignId } = list[Math.floor(Math.random() * list.length)];

      const { _id } = lotteryCampaign;

      if (totalCount === 0) {
        Alert.error('No customers in this Lottery Campaign');
      }
      if (isOpenNextChar) {
        this.props.getNextChar({
          campaignId: _id,
          awardId: currentTab._id,
          prevChars: nextChar
        });
      } else {
        const Count = currentTab.count - winnersTotalCount;

        if (Count > 0 && totalCount > 0) {
          if (multiple > 1 && totalCount > 1) {
            multipledoLottery({
              campaignId,
              awardId: currentTab._id,
              multiple
            });
          } else {
            doLotteries({ campaignId, awardId: currentTab._id });
          }
        } else {
          Alert.error('Already all winner announced in this award');
        }
      }
    };

    const getNextChars = () => {
      this.setState({ isOpenNextChar: !isOpenNextChar });
    };
    const handleMultiple = (e: any) => {
      this.setState({ multiple: parseInt(e.currentTarget.value) });
    };

    const MultiplyInput = () => {
      const inputMax = currentTab.count - winnersTotalCount;
      return (
        <div style={{ width: '150px', margin: ' 0 15px' }}>
          <FormControl
            defaultValue={multiple}
            name="buyScore"
            type="number"
            min={0}
            onChange={handleMultiple}
            max={inputMax || 0}
            required={true}
          />
        </div>
      );
    };

    return (
      <>
        <Wrapper.ActionBar
          left={currentTab.name}
          right={actionbarLotteryRight()}
        />
        <AwardContainer>
          <Button onClick={() => doLottery()}>Start</Button>
          <FormControl
            componentClass="checkbox"
            checked={isOpenNextChar}
            onChange={() => getNextChars()}
          />
          <FormControl
            componentClass="checkbox"
            checked={isOpenInput}
            onChange={() => this.setState({ isOpenInput: !isOpenInput })}
          />
        </AwardContainer>
        {isOpenInput && MultiplyInput()}
        {isOpenNextChar && NextChar()}
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {List(list, true)}
          {List(winners, true)}
        </div>
      </>
    );
  }
}
export default AwardContentComponent;
