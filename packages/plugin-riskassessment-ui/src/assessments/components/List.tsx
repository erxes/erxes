import {
  BarItems,
  Button,
  FormControl,
  HeaderDescription,
  Pagination,
  Table,
  Wrapper,
  __
} from '@erxes/ui/src';
import * as _loadash from 'lodash';
import React from 'react';
import { FlexRow, HeaderContent } from '../../styles';
import { headers } from '../common/Headers';
import { TableHead } from './ListHead';
import Row from './Row';
import { SideBar } from './SideBar';

type Props = {
  list: any[];
  totalCount: number;
  queryParams: any;
  history: any;
  remove: (ids: string[]) => void;
};

type State = {
  selectedAssessmentIds: string[];
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedAssessmentIds: []
    };
  }

  renderContent = () => {
    const { list, queryParams, history } = this.props;
    const { selectedAssessmentIds } = this.state;

    const handleSelect = (id: string) => {
      if (selectedAssessmentIds.includes(id)) {
        return this.setState({
          selectedAssessmentIds: selectedAssessmentIds.filter(
            selectedId => selectedId !== id
          )
        });
      }

      this.setState({ selectedAssessmentIds: [...selectedAssessmentIds, id] });
    };

    const handleSelectAll = () => {
      if (!selectedAssessmentIds.length) {
        this.setState({
          selectedAssessmentIds: list.map(assessment => assessment._id)
        });
      } else {
        this.setState({ selectedAssessmentIds: [] });
      }
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl
                componentClass="checkbox"
                checked={_loadash.isEqual(
                  selectedAssessmentIds,
                  list.map(assessment => assessment._id)
                )}
                onChange={handleSelectAll}
              />
            </th>
            <th>{__('Card type')}</th>
            <th>{__('Card Name')}</th>
            {headers(queryParams, history).map(header => (
              <TableHead
                key={header.name}
                filter={header.filter}
                sort={header.sort}
              >
                {header.label}
              </TableHead>
            ))}
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {(list || []).map(item => (
            <Row
              item={item}
              key={item._id}
              selecteAssessmentIds={selectedAssessmentIds}
              handleSelect={handleSelect}
              queryParams={queryParams}
              history={history}
            />
          ))}
        </tbody>
      </Table>
    );
  };

  render() {
    const { totalCount, queryParams, remove } = this.props;
    const { selectedAssessmentIds } = this.state;

    const leftActionBar = (
      <HeaderDescription
        title="Assessments"
        icon="/images/actions/13.svg"
        description=""
        renderExtra={
          <FlexRow>
            <HeaderContent>
              {__(`Total count`)}
              <h4>{totalCount || 0}</h4>
            </HeaderContent>
          </FlexRow>
        }
      />
    );

    const removeAssessments = () => {
      remove(selectedAssessmentIds);
      this.setState({ selectedAssessmentIds: [] });
    };

    const rightActionBar = (
      <BarItems>
        {!!selectedAssessmentIds.length && (
          <Button btnStyle="danger" onClick={removeAssessments}>
            {`Remove (${selectedAssessmentIds?.length || 0})`}
          </Button>
        )}
      </BarItems>
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={'Assessment'} />}
        actionBar={
          <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
        }
        leftSidebar={
          <SideBar history={this.props.history} queryParams={queryParams} />
        }
        content={this.renderContent()}
        footer={<Pagination count={totalCount} />}
      />
    );
  }
}

export default List;
