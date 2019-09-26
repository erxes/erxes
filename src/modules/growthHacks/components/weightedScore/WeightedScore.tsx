import MainActionBar from 'modules/boards/containers/MainActionBar';
import { BoardContainer } from 'modules/boards/styles/common';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import {
  FixedContainer,
  ScrollContent,
  TableHead
} from 'modules/growthHacks/styles';
import { IGrowthHack } from 'modules/growthHacks/types';
import Header from 'modules/layout/components/Header';
import { MainContent } from 'modules/layout/styles';
import React from 'react';
import GrowthHackAddTrigger from '../GrowthHackAddTrigger';
import GrowthHackMainActionBar from '../GrowthHackMainActionBar';
import Score from '../Score';

type Props = {
  queryParams: any;
  growthHacks: IGrowthHack[];
  bgColor?: string;
  hackScoringType: string;
};

class WeightedScore extends React.Component<Props> {
  onChangeValue = () => {
    return null;
  };

  renderHeader = () => {
    const { hackScoringType } = this.props;

    if (hackScoringType === 'rice') {
      return (
        <>
          <TableHead>{__('Reach')}</TableHead>
          <TableHead>{__('Impact')}</TableHead>
          <TableHead>{__('Confidence')}</TableHead>
          <TableHead>{__('Effort')}</TableHead>
        </>
      );
    }

    if (hackScoringType === 'ice') {
      return (
        <>
          <TableHead>{__('Impact')}</TableHead>
          <TableHead>{__('Confidence')}</TableHead>
          <TableHead>{__('Ease')}</TableHead>
        </>
      );
    }

    return (
      <>
        <TableHead>{__('Potential')}</TableHead>
        <TableHead>{__('Importance')}</TableHead>
        <TableHead>{__('Ease')}</TableHead>
      </>
    );
  };

  renderExtraInput = (value: number) => {
    if (this.props.hackScoringType === 'rice') {
      return (
        <td className="with-input">
          <input value={value} onChange={this.onChangeValue} />
        </td>
      );
    }

    return null;
  };

  renderContent = () => {
    const getValue = (value?: number) => value || 0;

    return (
      <FixedContainer>
        <ScrollContent>
          <Table hover={true}>
            <thead>
              <tr>
                <th>{__('Task name')}</th>
                {this.renderHeader()}
                <TableHead>{__('Score')}</TableHead>
              </tr>
            </thead>
            <tbody>
              {this.props.growthHacks.map(growthHack => {
                return (
                  <tr key={growthHack._id}>
                    <td>{growthHack.name}</td>
                    {this.renderExtraInput(getValue(growthHack.reach))}
                    <td className="with-input">
                      <input
                        value={getValue(growthHack.impact)}
                        onChange={this.onChangeValue}
                      />
                    </td>
                    <td className="with-input">
                      <input
                        value={getValue(growthHack.confidence)}
                        onChange={this.onChangeValue}
                      />
                    </td>
                    <td className="with-input">
                      <input
                        value={getValue(growthHack.ease)}
                        onChange={this.onChangeValue}
                      />
                    </td>
                    <td className="with-input">
                      <strong>
                        <Score.Amount
                          type={this.props.hackScoringType}
                          r={getValue(growthHack.reach)}
                          i={getValue(growthHack.impact)}
                          c={getValue(growthHack.confidence)}
                          e={getValue(growthHack.ease)}
                        />
                      </strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </ScrollContent>
        <GrowthHackAddTrigger />
      </FixedContainer>
    );
  };

  renderActionBar = () => (
    <MainActionBar type="growthHack" component={GrowthHackMainActionBar} />
  );

  render() {
    const breadcrumb = [{ title: __('Growth hack') }];

    return (
      <BoardContainer>
        <Header title={__('Growth hack')} breadcrumb={breadcrumb} />
        <MainContent
          transparent={true}
          style={{ margin: 0, backgroundColor: this.props.bgColor }}
        >
          {this.renderActionBar()}
          {this.renderContent()}
        </MainContent>
      </BoardContainer>
    );
  }
}

export default WeightedScore;
