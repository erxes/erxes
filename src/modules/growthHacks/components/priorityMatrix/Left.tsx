import LoadMore from 'modules/common/components/LoadMore';
import Table from 'modules/common/components/table';
import { IRouterProps } from 'modules/common/types';
import { router, __ } from 'modules/common/utils';
import { LeftContent, ScrollContent, Sort } from 'modules/growthHacks/styles';
import { IGrowthHackParams } from 'modules/growthHacks/types';
import React from 'react';
import { withRouter } from 'react-router';
import Select from 'react-select-plus';
import GrowthHackAddTrigger from '../GrowthHackAddTrigger';

interface IProps extends IRouterProps {
  queryParams: any;
  growthHacks: any[];
  totalCount: number;
  loading: boolean;
  refetch(): void;
  edit(id: string, doc: IGrowthHackParams): void;
}

class Left extends React.Component<IProps> {
  onEdit = (id: string, name: string, e) => {
    const { value } = e.target;
    const doc = { [name]: value ? parseInt(value, 0) : 0 };

    this.props.edit(id, doc);
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
        default:
      }

      router.setParams(this.props.history, {
        sortField,
        sortDirection,
        sortType: value.value
      });
    }
  };

  render() {
    const {
      totalCount,
      growthHacks,
      loading,
      queryParams,
      refetch
    } = this.props;

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
            value={queryParams.sortType || 1}
            placeholder="Sort"
            onChange={this.onChangeSort}
            options={selectOptions}
            clearable={false}
          />
        </Sort>
        <ScrollContent>
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
                        onChange={this.onEdit.bind(
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
                        onChange={this.onEdit.bind(
                          this,
                          growthHack._id,
                          'ease'
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

export default withRouter<IProps>(Left);
