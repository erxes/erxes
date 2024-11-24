import { useQuery } from '@apollo/client';
import React from 'react';

import Spinner from '@erxes/ui/src/components/Spinner';
import Webbuilder from '../components/WebBuilder';
import { queries } from '../graphql';

import Alert from '@erxes/ui/src/utils/Alert';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import cpQueries from '../../clientportal/graphql/queries';
import { skip } from 'node:test';


type Props = {
  id?: string;
};

const WebBuilderContainer = (props: Props) => {

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pageId = props.id;

  const { data:pageData, loading } = useQuery(queries.PAGE, {
    variables: {
      id: pageId,
    },
    fetchPolicy: 'network-only',
    skip: !pageId,
  });

  const { data: clientPortalData, loading: clientPortalLoading } = useQuery(
    cpQueries.DETAIL_QUERY,
    {
      variables: {
        id: pageData?.page?.clientPortalId
      },
      skip: !pageData
    }
  )

//   const [addMutation] = useMutation(mutations.POST_ADD);

//   const [editMutation] = useMutation(mutations.POST_EDIT);

  if (loading || clientPortalLoading) {
    return <Spinner />;
  }

  const page = pageData?.page;
  const clinetPortal = clientPortalData?.clientPortalGetConfig;

  console.log('clinetPortal', clinetPortal);
  console.log('page', page);


  const onSubmit = (doc: any) => {
    console.log('doc', doc);
    return
    if (pageId) {
      editMutation({
        variables: {
          id: pageId,
          input: doc,
        },
      }).then(() => {
        Alert.success('You successfully edited a post', 1500);
        console.log('success');
        setTimeout(() => {
          console.log('navigate');
          navigate(`/cms/posts/${clientPortalId}`, {
            replace: true,
          });
        }, 1500);
      });
    } else {
      addMutation({
        variables: {
          input: doc,
        },
      }).then((res: any) => {
        console.log('res', res);
        const postId = res.data.postsAdd._id;
        Alert.success('You successfully added a post', 1500);

        setTimeout(() => {
          navigate(`/cms/posts/${clientPortalId}/edit/${postId}`, {
            replace: true,
          });
        }, 1500);
      });
    }
  };

  const updatedProps = {
    ...props,
    clinetPortal,
    page,
    onSubmit,
  };

  return <Webbuilder {...updatedProps} />;
};



export default WebBuilderContainer;
