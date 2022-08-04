import { Alert, Button, ControlLabel, FormControl, FormGroup, Wrapper } from "@erxes/ui/src";
import { IRouterProps } from "@erxes/ui/src/types";
import React from "react";
import { AwardContainer, Card } from "../../../../styles";
import AwardList from "./list";

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
  lotteryCampaignWinnerList: any;
  lotteriesCampaignCustomerList: any;
}

class AwardContentComponent extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      multiple: 0,
      isOpenNextChar: false,
      isOpenInput: false,
    };
  }


  render() {
    const {
      currentTab,
      doLotteries,
      lotteryCampaignWinnerList,
      lotteriesCampaignCustomerList,
      winners,
      list,
      totalCount,
      winnersTotalCount,
      lotteryCampaign,
      multipledoLottery,
      getNextChar,
      nextChar
    } = this.props;
    const { multiple, isOpenNextChar, isOpenInput } = this.state;

    const actionbarLotteryRight = () => {
      return (
        <AwardContainer>
          {CheckBox("Use Next Character", isOpenNextChar, () =>
            this.setState({
              isOpenNextChar: !isOpenNextChar,
              isOpenInput: isOpenInput && false
            })
          )}
          {CheckBox("Use  MultiDoLottery", isOpenInput, () =>
            this.setState({
              isOpenInput: !isOpenInput,
              isOpenNextChar: isOpenNextChar && false,
              multiple: 0
            })
          )}
        </AwardContainer>
      );
    };
    const List = (data: any, totalCount: number, loading: boolean, isWinnerList: boolean) => {
      const updatedProps = {
        lotteries: data,
        totalCount: totalCount,
        loading: loading,
        isWinnerList
      };
      return <AwardList {...updatedProps} />;
    };
    const NextChar = () => {
      const numberFormat = lotteryCampaign.numberFormat.match(/ \* [0-9]* /g)[0].substring(3);

      return (
        <div style={{ display: "flex", flex: "row" }}>
          {Array.from(Array(parseInt(numberFormat)), (e, i) => {
            return <Card key={i}>{nextChar.charAt(i) || ""}</Card>;
          })}
        </div>
      );
    };
    const doLottery = () => {
      const { _id } = lotteryCampaign;
      const { campaignId } = list[Math.floor(Math.random() * list.length)];

      if (isOpenNextChar) {
        return getNextChar({
          campaignId: _id,
          awardId: currentTab._id,
          prevChars: nextChar
        });
      }
      if (multiple > 1) {
        return multipledoLottery({
          campaignId,
          awardId: currentTab._id,
          multiple
        });
      }
      doLotteries({ campaignId, awardId: currentTab._id });
    };

    const handleMultiple = (e: any) => {
      this.setState({ multiple: parseInt(e.currentTarget.value) });
    };

    const MultiplyInput = () => {
      const inputMax = currentTab.count - winnersTotalCount;
      const input = inputMax > totalCount ? totalCount : inputMax;
      return (
        <div style={{ width: "150px", margin: " 0 15px" }}>
          <ControlLabel>Enter the number:</ControlLabel>
          <FormControl defaultValue={multiple} name="buyScore" type="number" min={0} onChange={handleMultiple} max={input || 0} required={true} />
        </div>
      );
    };

    const CheckBox = (title: string, value: boolean, onchange: () => void) => {
      return (
        <FormGroup>
          <ControlLabel>{title}</ControlLabel>
          <FormControl componentClass="checkbox" checked={value} onChange={onchange} />
        </FormGroup>
      );
    };

    const BtnText = () => {
      if (isOpenNextChar) {
        if (nextChar.length === 6) {
          return "Restart";
        }
        return "Next Character";
      }
      return "Start";
    };

    return (
      <>
        <Wrapper.ActionBar
          left={
            <Button disabled={!this.props.list.length} onClick={() => doLottery()}>
              {BtnText()}
            </Button>
          }
          right={actionbarLotteryRight()}
        />
        {isOpenInput && MultiplyInput()}
        {isOpenNextChar && NextChar()}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}
        >
          {List(list, totalCount, lotteriesCampaignCustomerList.loading, true)}
          {List(winners, winnersTotalCount, lotteryCampaignWinnerList.loading, true)}
        </div>
      </>
    );
  }
}
export default AwardContentComponent;
