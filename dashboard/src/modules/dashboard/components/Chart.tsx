import React from 'react';

import Button from 'modules/common/components/Button';
import { SmallLoader } from 'modules/common/components/ButtonMutate';
import { FormControl } from 'modules/common/components/form';
import { TitleContainer } from 'modules/common/components/step/styles';
import { __, Alert } from 'modules/common/utils';
import { Link } from 'react-router-dom';
import { IDashboardItem } from '../types';
import ExploreQueryBuilder from './QueryBuilder/ExploreQueryBuilder';

type Props = {
  dashboardItem?: IDashboardItem;
  isActionLoading: boolean;
  dashboardId: string;
  save: (params: {
    _id?: string;
    name: string;
    vizState: string;
    dashboardId: string;
  }) => void;
};

type State = {
  vizState: string;
  name: string;
};

class Chart extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const dashboardItem = props.dashboardItem || {};

    this.state = {
      vizState: dashboardItem.vizState,
      name: dashboardItem.name
    };
  }

  setVizState = vizState => {
    this.setState({ vizState });
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, vizState } = this.state;
    const { dashboardId, dashboardItem } = this.props;

    if (!name) {
      return Alert.error('Write name');
    }
    if (!vizState) {
      return Alert.error('Choose chart');
    }

    const doc = {
      _id: dashboardItem ? dashboardItem._id : '',
      name,
      vizState,
      dashboardId
    };

    this.props.save(doc);
  };

  renderSaveButton = () => {
    const { isActionLoading } = this.props;

    const cancelButton = (
      <Link to="/leads">
        <Button btnStyle="simple" size="small" icon="cancel-1">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button
          disabled={isActionLoading}
          btnStyle="success"
          size="small"
          icon={isActionLoading ? undefined : 'checked-1'}
          onClick={this.handleSubmit}
        >
          {isActionLoading && <SmallLoader />}
          Save
        </Button>
      </Button.Group>
    );
  };

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);
  };

  render() {
    const { vizState, name } = this.state;

    const onChange = e =>
      this.onChange('name', (e.currentTarget as HTMLInputElement).value);

    return (
      <div>
        <TitleContainer>
          <div>{__('Name')}</div>
          <FormControl
            required={true}
            onChange={onChange}
            defaultValue={name}
            autoFocus={true}
          />
          {this.renderSaveButton()}
        </TitleContainer>
        <ExploreQueryBuilder
          vizState={vizState}
          setVizState={this.setVizState}
        />
      </div>
    );
  }
}

export default Chart;
