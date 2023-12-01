import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import Chooser from '@erxes/ui/src/components/Chooser';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { queries as productQueries } from '../../../graphql';

import { isEnabled, __ } from '@erxes/ui/src/utils/core';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import { IDeal } from '@erxes/ui-cards/src/deals/types';
import DealForm from './DealForm';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import { Button } from '@erxes/ui/src';
import { Attributes } from '../../../styles';

type Props = {
  data: { name: string; deals: IDeal[] };
  companyId?: string;
  pipelineId?: string;
  boardId?: string;
  closeModal: () => void;
  onSelect: (deals: IDeal[], companyId: string) => void;
  loadDiscountPercent?: (productsData: any) => void;
};

type FinalProps = {
  dealsQuery: any;
  companiesQuery: any;
} & Props;

type State = {
  perPage: number;
  stageId: string;
  boardId: string;
  pipelineId: string;
  companyId: string;
};

class DealChooser extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    const { boardId, companyId, stageId, pipelineId } = JSON.parse(
      localStorage.getItem('erxes_deals:chooser_filter') || '{}'
    );

    this.state = {
      perPage: 20,
      boardId: props.boardId || boardId || '',
      pipelineId: props.pipelineId || pipelineId || '',
      stageId: props.stageId || stageId || '',
      companyId: props.companyId || companyId || ''
    };
  }

  componentDidMount(): void {
    const { companyId, boardId, pipelineId, stageId } = JSON.parse(
      localStorage.getItem('erxes_deals:chooser_filter') || '{}'
    );

    const variables: any = { perPage: this.state.perPage };

    if (stageId) {
      this.setState({ stageId });
      variables.stageId = stageId;
    }

    if (pipelineId) {
      this.setState({ pipelineId });
      variables.pipelineId = pipelineId;
    }

    if (companyId) {
      this.setState({ companyId });
      variables.companyIds = [companyId];

      this.props.dealsQuery.refetch({
        ...variables
      });
    }

    if (companyId || boardId || pipelineId || stageId) {
      this.props.dealsQuery.refetch({
        ...variables
      });
    }
  }

  search = (value: string, reload?: boolean) => {
    if (!reload) {
      this.setState({ perPage: 0 });
    }

    this.setState({ perPage: this.state.perPage + 20 }, () =>
      this.props.dealsQuery.refetch({
        searchValue: value,
        perPage: this.state.perPage
      })
    );
  };

  onFilterSave = () => {
    const { companyId, boardId, stageId, pipelineId } = this.state;
    localStorage.setItem(
      'erxes_deals:chooser_filter',
      JSON.stringify({ companyId, boardId, stageId, pipelineId })
    );
  };

  generateVariables = () => {
    const { companyId, pipelineId, stageId } = this.state;
    const variables = {
      companyIds: undefined,
      pipelineId: '',
      stageId: ''
    } as any;
    if (companyId) {
      variables.companyIds = [companyId];
    }

    if (pipelineId) {
      variables.pipelineId = pipelineId;
    }
    if (stageId) {
      variables.stageId = stageId;
    }
    return variables;
  };

  onChangeCompany = (companyId: string) => {
    this.setState({ companyId }, () => {
      if (companyId !== '') {
        this.props.dealsQuery.refetch({
          ...this.generateVariables(),
          companyIds: [companyId],
          perPage: this.state.perPage
        });
        this.props.companiesQuery.refetch({
          _ids: [companyId]
        });
        this.onFilterSave();
      } else {
        this.props.dealsQuery.refetch({
          ...this.generateVariables(),
          companyIds: undefined,
          perPage: this.state.perPage
        });
        this.props.companiesQuery.refetch({
          _ids: [companyId]
        });
        this.onFilterSave();
      }
    });
  };

  onChangeBoard = (boardId: string) => {
    this.setState({ boardId }, () => {
      this.props.dealsQuery.refetch({
        ...this.generateVariables(),
        perPage: this.state.perPage
      });
      this.onFilterSave();
    });
  };
  onChangePipeline = (pipelineId: string) => {
    this.setState({ pipelineId }, () => {
      this.props.dealsQuery.refetch({
        ...this.generateVariables(),
        pipelineId,
        perPage: this.state.perPage
      });
      this.onFilterSave();
    });
  };

  onChangeStage = (stageId: string) => {
    this.setState({ stageId }, () => {
      this.props.dealsQuery.refetch({
        ...this.generateVariables(),
        stageId,
        perPage: this.state.perPage
      });
      this.onFilterSave();
    });
  };

  renderContent() {
    return (
      <Popover id="select-board-popover">
        <Attributes>
          <React.Fragment>
            <li>
              <b>Choose board</b>
            </li>
            {isEnabled('cards') && (
              <BoardSelect
                type={'deal'}
                stageId={this.state.stageId}
                boardId={this.state.boardId}
                pipelineId={this.state.pipelineId}
                onChangeStage={this.onChangeStage}
                onChangePipeline={this.onChangePipeline}
                onChangeBoard={this.onChangeBoard}
              />
            )}
          </React.Fragment>
        </Attributes>
      </Popover>
    );
  }

  rendeCompanyChooser = () => {
    const { companyId } = this.state;

    return (
      <>
        {(isEnabled('contacts') && (
          <SelectCompanies
            label="Company"
            name="ownerId"
            multi={false}
            initialValue={companyId}
            onSelect={company => this.onChangeCompany(company as string)}
            customOption={{ label: 'Choose company', value: '' }}
          />
        )) || <></>}

        <OverlayTrigger
          trigger="click"
          placement="top"
          overlay={this.renderContent()}
          rootClose={true}
          container={this}
        >
          <Button>Choose board</Button>
        </OverlayTrigger>
      </>
    );
  };

  onSelectDeal = datas => {
    if (this.state.companyId === '') {
      return Alert.warning('You must choose company');
    }
    this.props.onSelect(datas, this.state.companyId);
  };

  extraChecker = datas => {
    if (this.state.companyId === '') {
      return Alert.warning('You must choose company');
    }
    datas?.forEach(deal => {
      if (
        !(
          deal.companies &&
          deal.companies.some(company => company._id === this.state.companyId)
        )
      ) {
        return Alert.warning('Choose correct deals');
      } else {
        this.onSelectDeal(datas);
        this.props.closeModal();
      }
    });
  };

  render() {
    const { data, dealsQuery } = this.props;

    const updatedProps = {
      ...this.props,
      data: { name: data.name, datas: data.deals },
      search: this.search,
      title: 'Deal',
      renderName: (deal: IDeal) => {
        return deal.name;
      },
      renderForm: ({ closeModal }: { closeModal: () => void }) =>
        isEnabled('cards') && (
          <DealForm closeModal={closeModal} stageId={this.state.stageId} />
        ),
      perPage: this.state.perPage,
      clearState: () => this.search('', true),
      datas: dealsQuery.deals || [],
      onSelect: this.onSelectDeal
    };

    return (
      <Chooser
        {...updatedProps}
        renderFilter={this.rendeCompanyChooser}
        extraChecker={this.extraChecker}
        modalSize="lg"
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<{
      perPage: number;
      categoryId: string;
      companyId: string;
      pipelineId: string;
    }>(gql(productQueries.deals), {
      name: 'dealsQuery',
      options: props => {
        const variables = {
          perPage: props.perPage || 20
        } as any;

        if (props.companyId) {
          variables.companyIds = [props.companyId];
        }
        if (props.pipelineId) {
          variables.pipelineId = props.pipelineId;
        }

        return {
          variables,
          fetchPolicy: 'network-only'
        };
      }
    })
  )(DealChooser)
);
