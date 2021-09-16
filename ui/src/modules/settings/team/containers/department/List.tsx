import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import React from 'react';
import { useQuery } from 'react-apollo';

import List from '../../components/department/List';
import { queries } from '../../graphql'

export default function ListContainer() {
    const { data, loading } = useQuery(gql(queries.departments));

    if (loading) {
        return <Spinner />
    }

    const list = data.departments as any[] || [];

    return <List list={list} />
}