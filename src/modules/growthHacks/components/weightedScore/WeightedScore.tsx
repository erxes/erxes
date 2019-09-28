import MainActionBar from 'modules/boards/containers/MainActionBar';
import withPipeline from 'modules/boards/containers/withPipeline';
import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import { IPipeline } from 'modules/boards/types';
import LoadMore from 'modules/common/components/LoadMore';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import {
  FixedContainer,
  ScrollContent,
  TableHead
} from 'modules/growthHacks/styles';
import { IGrowthHack } from 'modules/growthHacks/types';
import Header from 'modules/layout/components/Header';
import React from 'react';
import GrowthHackAddTrigger from '../GrowthHackAddTrigger';
import GrowthHackMainActionBar from '../GrowthHackMainActionBar';
import Score from '../Score';

type Props = {
  queryParams: any;
  growthHacks: IGrowthHack[];
  refetch?: () => void;
  totalCount: number;
  loading: boolean;
  pipeline: IPipeline;
};

class WeightedScore extends React.Component<Props> {
  onChangeValue = () => {
    return null;
  };

  renderHeader = () => {
    const { hackScoringType } = this.props.pipeline;

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
    if (this.props.pipeline.hackScoringType === 'rice') {
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

    const { totalCount, loading } = this.props;

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
                          type={this.props.pipeline.hackScoringType}
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
          <LoadMore perPage={15} all={totalCount} loading={loading} />
        </ScrollContent>
        <GrowthHackAddTrigger refetch={this.props.refetch} />
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
        <BoardContent transparent={true} bgColor={this.props.pipeline.bgColor}>
          {this.renderActionBar()}
          {this.renderContent()}
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default withPipeline(WeightedScore);
