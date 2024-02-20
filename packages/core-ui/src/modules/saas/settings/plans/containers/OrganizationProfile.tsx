import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { isValidURL } from 'modules/common/utils/urlParser';
import {
  ConfigsQueryResponse,
  IConfigsMap,
} from '@erxes/ui-settings/src/general/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, confirm, withProps } from '../../../../common/utils';
import OrganizationProfile from '../components/OrganizationProfile';
import { mutations } from '../graphql';
import {
  queries as generalQueries,
  mutations as generalMutations,
} from '../../../../settings/general/graphql';
import {
  editOrganizationDomainMutationResponse,
  editOrganizationInfoMutationResponse,
  IOrganization,
} from '../types';
import { getSubdomain } from '@erxes/ui/src/utils/core';

type Props = {
  currentOrganization: IOrganization;
};

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
} & Props;

const OrganizationProfileContainer = (
  props: FinalProps &
    editOrganizationInfoMutationResponse &
    editOrganizationDomainMutationResponse,
) => {
  const {
    editOrganizationMutation,
    updateConfigs,
    configsQuery,
    editOrganizationDomainMutation,
  } = props;

  const editOrganization = (
    {
      icon,
      link,
      name,
      iconColor,
      textColor,
      logo,
      backgroundColor,
      favicon,
      domain,
      description,
      map,
    }: {
      icon: string;
      link: string;
      logo?: string;
      domain?: string;
      textColor?: string;
      favicon?: string;
      iconColor?: string;
      name: string;
      backgroundColor?: string;
      description?: string;
      map?: IConfigsMap;
    },
    callback?: () => void,
  ) => {
    if (domain && domain.length > 1) {
      if (!isValidURL(domain)) {
        return Alert.error('Please enter a valid domain');
      }
    }

    confirm('Are you sure???').then(() => {
      updateConfigs({
        variables: { configsMap: map },
      });

      editOrganizationMutation({
        variables: {
          icon,
          logo,
          link,
          name,
          domain,
          textColor,
          favicon,
          iconColor,
          backgroundColor,
          description,
        },
      })
        .then(({ data }) => {
          Alert.success('Success');

          if (callback) {
            callback();
          }

          const { editOrganizationInfo } = data;
          const { subdomain } = editOrganizationInfo;

          const oldSubdomain = getSubdomain();

          if (subdomain !== oldSubdomain) {
            const origin = window.location.origin;
            window.location.replace(origin.replace(oldSubdomain, subdomain));
          } else {
            window.location.reload();
          }
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const editOrganizationDomain = ({
    type,
    domain,
  }: {
    type: string;
    domain: string;
  }) => {
    if (domain && domain.length > 1) {
      if (!isValidURL(domain)) {
        return Alert.error('Please enter a valid domain');
      }
    }

    confirm('Are you sure???').then(() => {
      editOrganizationDomainMutation({
        variables: {
          type,
          domain,
        },
      })
        .then(() => {
          Alert.success('Success');

          window.location.reload();
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  if (configsQuery.loading) {
    return null;
  }

  const configs = configsQuery.configs || [];

  const configsMap = {};

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  return (
    <OrganizationProfile
      {...props}
      editDomain={editOrganizationDomain}
      save={editOrganization}
      configsMap={configsMap}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, editOrganizationInfoMutationResponse, {}>(
      gql(mutations.editOrganizationInfo),
      {
        name: 'editOrganizationMutation',
        options: {
          refetchQueries: ['currentUser'],
        },
      },
    ),

    graphql<Props, editOrganizationDomainMutationResponse, {}>(
      gql(mutations.editOrganizationDomain),
      {
        name: 'editOrganizationDomainMutation',
        options: {
          refetchQueries: ['currentUser'],
        },
      },
    ),

    graphql<{}, ConfigsQueryResponse>(gql(generalQueries.configs), {
      name: 'configsQuery',
    }),
    graphql<{}>(gql(generalMutations.updateConfigs), {
      name: 'updateConfigs',
    }),
  )(OrganizationProfileContainer),
);
