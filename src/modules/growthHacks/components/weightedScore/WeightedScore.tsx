import MainActionBar from 'modules/boards/containers/MainActionBar';
import withPipeline from 'modules/boards/containers/withPipeline';
import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import { IPipeline } from 'modules/boards/types';
import LoadMore from 'modules/common/components/LoadMore';
import Table from 'modules/common/components/table';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import {
  FixedContainer,
  ScrollContent,
  TableHead
} from 'modules/growthHacks/styles';
import { IGrowthHack, IGrowthHackParams } from 'modules/growthHacks/types';
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
  save(id: string, doc: IGrowthHackParams): void;
};

class WeightedScore extends React.Component<Props> {
  onSave = (id: string, name: string, e) => {
    const { value } = e.target;
    const doc = { [name]: value ? parseInt(value, 0) : 0 };

    this.props.save(id, doc);
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

  renderInput(growthHack: IGrowthHack, type: string) {
    const { hackScoringType } = this.props.pipeline;

    if (hackScoringType !== 'rice' && type === 'reach') {
      return null;
    }

    return (
      <td className="with-input">
        <input
          type="number"
          min={0}
          max={10}
          value={growthHack[type]}
          onChange={this.onSave.bind(this, growthHack._id, type)}
        />
      </td>
    );
  }

  renderContent = () => {
    const { totalCount, loading, pipeline, growthHacks } = this.props;

    return (
      <FixedContainer>
        <ScrollContent>
          <Table hover={true}>
            <thead>
              <tr>
                <th>{__('Experiment name')}</th>
                {this.renderHeader()}
                <TableHead>{__('Score')}</TableHead>
              </tr>
            </thead>
            <tbody className="weighted-score-table-body">
              {growthHacks.map(growthHack => {
                return (
                  <tr key={growthHack._id}>
                    <td>{growthHack.name}</td>
                    {this.renderInput(growthHack, 'reach')}
                    {this.renderInput(growthHack, 'impact')}
                    {this.renderInput(growthHack, 'confidence')}
                    {this.renderInput(growthHack, 'ease')}
                    <td className="with-input">
                      <strong>
                        <Score.Amount
                          type={pipeline.hackScoringType}
                          r={growthHack.reach || 0}
                          i={growthHack.impact || 0}
                          c={growthHack.confidence || 0}
                          e={growthHack.ease || 0}
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
    const breadcrumb = [
      { title: __('Growth hacking'), link: '/growthHack/board' },
      { title: __('Weighted scoring') }
    ];

    return (
      <BoardContainer>
        <Header title={__('Growth hack')} breadcrumb={breadcrumb} />
        <BoardContent transparent={true} bgColor={colors.bgMain}>
          {this.renderActionBar()}
          {this.renderContent()}
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default withPipeline(WeightedScore);
