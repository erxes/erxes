import { LeftContent, ScrollContent } from '../../styles';

import GrowthHackAddTrigger from '../GrowthHackAddTrigger';
import { IGrowthHackParams } from '../../types';
import LoadMore from '@erxes/ui/src/components/LoadMore';
import React from 'react';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils/core';

interface IProps {
  queryParams: any;
  growthHacks: any[];
  totalCount: number;
  loading: boolean;
  refetch(): void;
  save(id: string, doc: IGrowthHackParams): void;
}

class Left extends React.Component<IProps> {
  onSave = (id: string, name: string, e) => {
    const { value } = e.target;
    const doc = { [name]: value ? parseInt(value, 0) : 0 };

    this.props.save(id, doc);
  };

  render() {
    const { totalCount, growthHacks, loading, refetch } = this.props;

    return (
      <LeftContent>
        <ScrollContent>
          <Table $hover={true}>
            <thead>
              <tr>
                <th>{__('Experiment name')}</th>
                <th style={{ width: 40 }}>{__('Impact')}</th>
                <th style={{ width: 40 }}>{__('Effort')}</th>
              </tr>
            </thead>
            <tbody className="with-input">
              {growthHacks.map((growthHack) => {
                return (
                  <tr key={growthHack._id}>
                    <td>{growthHack.name}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        defaultValue={growthHack.impact}
                        onChange={this.onSave.bind(
                          this,
                          growthHack._id,
                          'impact',
                        )}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        defaultValue={growthHack.ease}
                        onChange={this.onSave.bind(
                          this,
                          growthHack._id,
                          'ease',
                        )}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <LoadMore perPage={15} all={totalCount} loading={loading} />
        </ScrollContent>
        <GrowthHackAddTrigger refetch={refetch} />
      </LeftContent>
    );
  }
}

export default Left;
