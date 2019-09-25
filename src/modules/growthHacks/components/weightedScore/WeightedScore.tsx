import MainActionBar from 'modules/boards/containers/MainActionBar';
import { BoardContainer } from 'modules/boards/styles/common';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import { FixedContainer } from 'modules/growthHacks/styles';
import { IGrowthHack } from 'modules/growthHacks/types';
import Header from 'modules/layout/components/Header';
import { MainContent } from 'modules/layout/styles';
import React from 'react';
import GrowthHackMainActionBar from '../GrowthHackMainActionBar';

type Props = {
  queryParams: any;
  growthHacks: IGrowthHack[];
};

class WeightedScore extends React.Component<Props> {
  renderContent = () => (
    <FixedContainer>
      <Table hover={true}>
        <thead>
          <tr>
            <th>{__('Task name')}</th>
            <th style={{ width: 40 }}>{__('Reach')}</th>
            <th style={{ width: 40 }}>{__('Impact')}</th>
            <th style={{ width: 40 }}>{__('Confidence')}</th>
            <th style={{ width: 40 }}>{__('Effort')}</th>
            <th style={{ width: 40 }}>{__('Score')}</th>
          </tr>
        </thead>
        <tbody className="with-input">
          {this.props.growthHacks.map(growthHack => {
            return (
              <tr key={growthHack._id}>
                <td>{growthHack.name}</td>
                <td>
                  <input type="number" value={growthHack.reach} />
                </td>
                <td>
                  <input type="number" value={growthHack.impact} />
                </td>
                <td>
                  <input type="number" value={growthHack.confidence} />
                </td>
                <td>
                  <input type="number" value={growthHack.ease} />
                </td>
                <td>
                  <b>{growthHack.reach}</b>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </FixedContainer>
  );

  renderActionBar = () => (
    <MainActionBar type="growthHack" component={GrowthHackMainActionBar} />
  );

  render() {
    const breadcrumb = [{ title: __('Growth hack') }];

    return (
      <BoardContainer>
        <Header title={__('Growth hack')} breadcrumb={breadcrumb} />
        <MainContent transparent={true} style={{ margin: 0 }}>
          {this.renderActionBar()}
          {this.renderContent()}
        </MainContent>
      </BoardContainer>
    );
  }
}

export default WeightedScore;
