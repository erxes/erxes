import {
  ButtonMutate,
  Chooser,
  ControlLabel,
  EmptyState,
  FormGroup,
  Spinner,
  Toggle,
  __
} from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import { DetailPopOver } from '../../../assessments/common/utils';
import RiskIndicatorForm from '../../../indicator/containers/Form';
import { mutations as riskIndicatorMutattions } from '../../../indicator/graphql';
import RiskGroupsForm from '../../../indicator/groups/containers/Form';
import { queries as groupsQueries } from '../../../indicator/groups/graphql';
import { SelectGroupsAssignedUsers } from '../common/utils';
import { queries } from '../graphql';

type Props = {
  detail: any;
  cardId: string;
  cardType: string;
  refetchQueries: ({ id }: { id: string }) => any;
  closeModal: () => void;
  handleSelect: ({
    indicatorId,
    groupId,
    groupsAssignedUsers
  }: {
    indicatorId?: string;
    groupId?: string;
    groupsAssignedUsers?: any[];
  }) => void;

  filters: {
    branchId: string;
    departmentId: string;
    operationId: string;
  };
};

export default function SelectIndicators(props: Props) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [perPage, setPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [useGroups, setUseGroups] = useState(false);
  const [groupsAssignedUsers, setGroupsAssignedUsers] = useState<any[]>([]);
  const [isSplittedUsers, setSplitUsers] = useState(false);
  const { data, error, loading } = useQuery(
    gql(useGroups ? groupsQueries.list : queries.riskIndicators),
    {
      variables: { searchValue, perPage, ...props.filters }
    }
  );
  useEffect(() => {
    if (props.detail) {
      fethcDetail();
    }
  }, [searchValue, data]);

  if (error) {
    return <EmptyState text="Something went wrong" />;
  }

  if (loading) {
    return <Spinner />;
  }

  const list = data[useGroups ? 'riskIndicatorsGroups' : 'riskIndicators'];

  const renderAddForm = props => {
    if (useGroups) {
      return <RiskGroupsForm {...props} />;
    }

    const generateDoc = values => {
      return { ...values };
    };

    const renderButton = ({
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={riskIndicatorMutattions.riskIndicatorAdd}
          variables={values}
          callback={callback}
          refetchQueries={props.refetchQueries}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully added risk assessment`}
        />
      );
    };

    return (
      <RiskIndicatorForm
        {...props}
        renderButton={renderButton}
        generateDoc={generateDoc}
      />
    );
  };

  const renderFilters = () => {
    const toggleGrouping = () => {
      setUseGroups(useGroups => !useGroups);
      setSplitUsers(false);
      setSelectedItems([]);
    };

    const toggleSplitAssignedUsers = () => {
      setSplitUsers(isSplittedUsers => !isSplittedUsers);
    };

    return (
      <DetailPopOver title="Filters" icon="downarrow-2">
        <FormGroup>
          <ControlLabel>{__('Use groups of indicators')}</ControlLabel>
          <Toggle onChange={toggleGrouping} checked={useGroups} />
        </FormGroup>
        {useGroups && (
          <FormGroup>
            <ControlLabel>
              {__('Split assigned team members to groups of indicators')}
            </ControlLabel>
            <Toggle
              onChange={toggleSplitAssignedUsers}
              checked={isSplittedUsers}
            />
          </FormGroup>
        )}
      </DetailPopOver>
    );
  };
  const search = (value: string, reload?: boolean) => {
    if (!reload) {
      setPerPage(10);
    }
    setPerPage(perPage + 5);
    setSearchValue(value);
  };

  const { closeModal, handleSelect } = props;

  const onSelect = value => {
    const selectedItemIds = value.map(item => item._id);
    setSelectedItems(selectedItemIds);

    const fieldName = useGroups ? 'groupId' : 'indicatorId';

    handleSelect({ [fieldName]: selectedItemIds[0], groupsAssignedUsers });
  };
  function fethcDetail() {
    const { detail } = props;
    if (detail.groupId) {
      setUseGroups(true);
      if (detail.isSplittedUsers) setSplitUsers(true);
      client
        .query({
          query: gql(groupsQueries.list),
          fetchPolicy: 'network-only',
          variables: { ids: [detail.groupId] }
        })
        .then(res => {
          const { riskIndicatorsGroups } = res.data;
          if (!!riskIndicatorsGroups?.length) {
            setSelectedItems(riskIndicatorsGroups);
          }
        });
    }
    if (detail.indicatorId && !useGroups) {
      client
        .query({
          query: gql(queries.riskIndicators),
          fetchPolicy: 'network-only',
          variables: { ids: [detail.indicatorId] }
        })
        .then(res => {
          const { riskIndicators } = res.data;
          if (!!riskIndicators?.length) {
            setSelectedItems(riskIndicators);
          }
        });
    }
  }

  const hadleExtraField = data => {
    setSelectedItems([data]);
  };

  const renderExtraField = () => {
    if (!useGroups || !selectedItems.length || !isSplittedUsers) {
      return;
    }

    const { cardId, cardType, detail } = props;

    const handleSelect = (
      groupsAssignedUsers: { groupId: string; assignedUserIds: string[] }[]
    ) => {
      setGroupsAssignedUsers(groupsAssignedUsers);
    };

    const groups = selectedItems[0].groups || [];

    return (
      <SelectGroupsAssignedUsers
        cardId={cardId}
        cardType={cardType}
        groups={groups}
        handleSelect={handleSelect}
        riskAssessmentId={detail?._id}
      />
    );
  };

  const updateProps = {
    title: `${useGroups ? 'Indicators Groups' : `Indicators`}`,
    datas: list || [],
    data: { name: 'Risk Assessment', datas: selectedItems },
    search: search,
    clearState: () => search('', true),
    renderName: indicator => indicator.name,
    renderForm: renderAddForm,
    onSelect,
    closeModal: () => closeModal(),
    perPage: perPage,
    renderFilter: renderFilters,
    limit: 1,
    renderExtra: renderExtraField,
    handleExtra: hadleExtraField
  };
  return <Chooser {...updateProps} />;
}
