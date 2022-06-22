import {
  DataWithLoader,
  FormControl,
  Info,
  Spinner,
  Table,
  __
} from '@erxes/ui/src';
import { Wrapper } from '@erxes/ui/src/layout';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { menuLoyalties } from '../../common/constants';
import Sidebar from '../components/Sidebar';
import { IScoreLogParams } from '../types';
import * as dayjs from 'dayjs';

interface IProps extends IRouterProps {
  loading: boolean;
  error: any;
  queryParams: any;
  history: any;
  scoreLogs: [IScoreLogParams];
  total: number;
}

type State = {
  checked: {
    all: boolean;
    single: number[];
  };
};

class ScoreLogsListComponent extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      checked: {
        all: false,
        single: []
      }
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.checked.all) {
      // this.setState(prev=>({checked:{...prev.checked,single:Array.from(Array(this.props.total).keys())}}))
    }
  }

  render() {
    const {
      loading,
      queryParams,
      history,
      scoreLogs,
      total,
      error
    } = this.props;
    const { checked } = this.state;

    const tablehead = [
      'Email',
      'Owner Type',
      'Changed Score',
      'Total Score',
      'Created At'
    ];

    if (loading) {
      return <Spinner />;
    }

    const handleSelect = (key, i) => {
      if (key === 'all') {
        this.setState(
          prev =>
            ({
              checked: { ...prev.checked, [key]: !prev.checked[key] }
            } as Pick<State, keyof State>)
        );
      }
      if (key === 'single') {
        if (checked.single.includes(i)) {
          return this.setState(
            prev =>
              ({
                checked: {
                  ...prev.checked,
                  [key]: prev.checked[key].filter(p => p !== i)
                }
              } as Pick<State, keyof State>)
          );
        }
        this.setState(prev => ({
          checked: { ...prev.checked, [key]: [...prev.checked[key], i] }
        }));
      }
    };

    const Content = error ? (
      <Info>{error.message}</Info>
    ) : (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl
                componentClass="checkbox"
                checked={checked.all}
                onChange={() => handleSelect('all', null)}
              />
            </th>
            {tablehead.map(p => (
              <th key={p}>{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scoreLogs?.map((p, i) => (
            <tr key={i}>
              <td>
                <FormControl
                  componentClass="checkbox"
                  checked={checked.single.includes(i)}
                  onChange={() => handleSelect('single', i)}
                />
              </td>
              <td>{p.owner.email}</td>
              <td>{p.ownerType}</td>
              <td>{p.changeScore}</td>
              <td>{p.owner.score}</td>
              <td>{dayjs(p.createdAt).format('lll')}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );

    const header = (
      <Wrapper.Header title={__('Score') + `(${1})`} submenu={menuLoyalties} />
    );

    const sidebar = (
      <Sidebar
        loadingMainQuery={loading}
        queryParams={queryParams}
        history={history}
      />
    );

    const content = (
      <>
        <DataWithLoader
          data={Content}
          loading={loading}
          count={total}
          emptyText="Empty list"
          emptyImage="/images/actions/1.svg"
        />
      </>
    );

    return <Wrapper header={header} leftSidebar={sidebar} content={content} />;
  }
}

export default withRouter<IRouterProps>(ScoreLogsListComponent);
