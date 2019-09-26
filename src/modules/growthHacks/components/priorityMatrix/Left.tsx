import LoadMore from 'modules/common/components/LoadMore';
import Table from 'modules/common/components/table';
import { IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { router } from 'modules/common/utils';
import { LeftContent, Sort } from 'modules/growthHacks/styles';
import { IGrowthHackParams } from 'modules/growthHacks/types';
import React from 'react';
import { withRouter } from 'react-router';
import Select from 'react-select-plus';

interface IProps extends IRouterProps {
  queryParams: any;
  growthHacks: any[];
  totalCount: number;
  loading: boolean;
  save(id: string, doc: IGrowthHackParams): void;
}

class Left extends React.Component<IProps> {
  onSave = (id: string, name: string, e) => {
    const { value } = e.target;
    const doc = { [name]: value ? parseInt(value, 0) : 0 };

    this.props.save(id, doc);
  };

  onChangeSort = value => {
    if (value) {
      let sortField = '';
      let sortDirection = '';

      switch (value.value) {
        case 2: {
          sortField = 'impact';
          sortDirection = '1';

          break;
        }
        case 3: {
          sortField = 'impact';
          sortDirection = '-1';

          break;
        }
        case 4: {
          sortField = 'ease';
          sortDirection = '1';

          break;
        }
        case 5: {
          sortField = 'ease';
          sortDirection = '-1';

          break;
        }
        default: {
          // tslint:disable-next-line: no-console
          console.log('value: ', value.value);
        }
      }

      router.setParams(this.props.history, {
        sortField,
        sortDirection,
        sortType: value.value
      });
    }
  };

  render() {
    const { totalCount, growthHacks, loading, queryParams } = this.props;

    const selectOptions = [
      { value: 1, label: 'Original order' },
      { value: 2, label: 'Low impact' },
      { value: 3, label: 'High impact' },
      { value: 4, label: 'Low effort' },
      { value: 5, label: 'High effort' }
    ];

    return (
      <LeftContent>
        <Sort>
          <Select
            value={queryParams.sortType}
            placeholder="Sort"
            onChange={this.onChangeSort}
            options={selectOptions}
          />
        </Sort>
        <Table hover={true}>
          <thead>
            <tr>
              <th>{__('Task name')}</th>
              <th style={{ width: 40 }}>{__('Impact')}</th>
              <th style={{ width: 40 }}>{__('Effort')}</th>
            </tr>
          </thead>
          <tbody className="with-input">
            {growthHacks.map(growthHack => {
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
                        'impact'
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      defaultValue={growthHack.ease}
                      onChange={this.onSave.bind(this, growthHack._id, 'ease')}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <LoadMore perPage={10} all={totalCount} loading={loading} />
      </LeftContent>
    );
  }
}

export default withRouter<IProps>(Left);
