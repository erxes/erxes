import { IPipeline } from '@erxes/ui-cards/src/boards/types';
import LoadMore from '@erxes/ui/src/components/LoadMore';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils/core';
import { FixedContainer, ScrollContent, TableHead } from '../../styles';
import { IGrowthHack, IGrowthHackParams } from '../../types';
import React from 'react';
import GrowthHackAddTrigger from '../GrowthHackAddTrigger';
import Score from '../Score';

type Props = {
  growthHacks: IGrowthHack[];
  totalCount: number;
  loading: boolean;
  pipeline?: IPipeline;
  refetch?: () => void;
  save(id: string, doc: IGrowthHackParams): void;
};

class Content extends React.Component<Props> {
  onSave = (id: string, name: string, e) => {
    const { value } = e.target;
    const doc = { [name]: value ? parseInt(value, 0) : 0 };

    this.props.save(id, doc);
  };

  renderHeader = () => {
    const { hackScoringType = 'ice' } = this.props.pipeline || {};

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
    const { hackScoringType = 'ice' } = this.props.pipeline || {};

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

  render() {
    const { totalCount, loading, pipeline, growthHacks, refetch } = this.props;

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
                          type={pipeline ? pipeline.hackScoringType : 'ice'}
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
        <GrowthHackAddTrigger refetch={refetch} />
      </FixedContainer>
    );
  }
}

export default Content;
