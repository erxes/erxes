import React from 'react';
import styled from 'styled-components';

import Button from '@erxes/ui/src/components/Button';
import { Shell } from '@erxes/ui-engage/src/styles';
import { IEngageLog } from '@erxes/ui-engage/src/types';
import { __ } from '@erxes/ui/src/utils/core';

const ButtonWrapper = styled.div`
  padding: 10px 0;
  text-align: center;
`;

type Props = {
  logs: IEngageLog[];
  fetchMore: (skip: number) => void;
};

type State = {
  perPage: number;
};

export default class EngageLogs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { perPage: 20 };
  }

  loadMore() {
    this.setState({ perPage: this.state.perPage + 100 });

    this.props.fetchMore(this.state.perPage + 100);
  }

  render() {
    const { logs } = this.props;

    return (
      <Shell>
        <div className="shell-wrap">
          <p className="shell-top-bar">{__('Log messages')}</p>
          <ul className="shell-body">
            {logs.map((log, index) => (
              <li key={index}>{log.message}</li>
            ))}
          </ul>
        </div>
        <ButtonWrapper>
          <Button btnStyle="simple" onClick={() => this.loadMore()}>
            {__('Load more')}
          </Button>
        </ButtonWrapper>
      </Shell>
    );
  }
}
