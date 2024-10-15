import React from 'react'
import Pinned from '../../components/section/Pinned';
import { mutations, queries } from '../../graphql';
import { gql, useQuery, useMutation } from "@apollo/client";
import * as compose from 'lodash.flowright';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from "@erxes/ui/src/utils/index";
import { router } from "@erxes/ui/src/utils";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "@erxes/ui/src/utils/Alert/index";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";

type Props = {
    queryParams: any;
};

type FinalProps = {
    currentUser: IUser
} & Props

const PinnedContainer = (props: FinalProps) => {

    const { queryParams, currentUser } = props

    const location = useLocation();
    const navigate = useNavigate();

    const insightPinnedListQuery = useQuery(
        gql(queries.insightPinnedList)
    );

    const [reportUpdate] = useMutation(gql(mutations.reportEdit), {
        refetchQueries: [
            {
                query: gql(queries.sectionList),
                variables: { type: "report" },
            },
            {
                query: gql(queries.reportList),
            },
            {
                query: gql(queries.insightPinnedList),
            },
        ],
    });

    const [dashboardUpdate] = useMutation(gql(mutations.dashboardEdit), {
        refetchQueries: [
            {
                query: gql(queries.sectionList),
                variables: { type: "dashboard" },
            },
            {
                query: gql(queries.dashboardList),
            },
            {
                query: gql(queries.insightPinnedList),
            },
        ],
    });

    const [reportRemove] = useMutation(
        gql(mutations.reportRemove),
        {
            refetchQueries: [
                {
                    query: gql(queries.sectionList),
                    variables: { type: "report" },
                },
                {
                    query: gql(queries.reportList),
                },
                {
                    query: gql(queries.insightPinnedList),
                },
            ],
        }
    );

    const [dashboardRemove] = useMutation(gql(mutations.dashboardRemove), {
        refetchQueries: [
            {
                query: gql(queries.sectionList),
                variables: { type: "dashboard" },
            },
            {
                query: gql(queries.dashboardList),
            },
            {
                query: gql(queries.insightPinnedList),
            },
        ],
    });

    const remove = (id: string, type: string) => {
        confirm(__(`Are you sure to delete selected ${type}?`)).then(() => {
            let removeMutation;

            if (type === "dashboard") {
                removeMutation = dashboardRemove;
            }

            if (type === "report") {
                removeMutation = reportRemove;
            }

            removeMutation({
                variables: { id },
            })
                .then(() => {
                    if (queryParams[`${type}Id`] === id) {
                        router.removeParams(
                            navigate,
                            location,
                            ...Object.keys(queryParams)
                        );
                    }
                    Alert.success(`You successfully deleted a ${type}`);
                })
                .catch((e) => {
                    Alert.error(e.message);
                });
        });
    };

    const update = (_id: string, type: string) => {
        const variables = { _id, userId: currentUser._id }

        if (type === "dashboard") {
            return dashboardUpdate({ variables })
        }

        if (type === "report") {
            return reportUpdate({ variables })
        }
    };

    const pinnedList = insightPinnedListQuery?.data?.insightPinnedList || []

    const updatedProps = {
        ...props,
        loading: insightPinnedListQuery.loading,
        list: pinnedList,
        update,
        remove
    };

    return (
        <Pinned {...updatedProps} />
    )
}

export default compose(withCurrentUser(PinnedContainer))