import { useQuery } from '@apollo/react-hooks';
import { isQueryPresent } from '@cubejs-client/react';
import { Alert, Button, Spin, Typography } from 'antd';
import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ExploreQueryBuilder from '../components/QueryBuilder/ExploreQueryBuilder';
import TitleModal from '../components/TitleModal';
import { GET_DASHBOARD_ITEM } from '../graphql/queries';

const ExplorePage = withRouter(({ history, location }) => {
  const [addingToDashboard, setAddingToDashboard] = useState(false);
  const params = new URLSearchParams(location.search);
  const itemId = params.get('itemId');
  const { loading, error, data } = useQuery(GET_DASHBOARD_ITEM, {
    variables: {
      id: itemId
    },
    skip: !itemId
  });
  const [vizState, setVizState] = useState(null);
  const finalVizState =
    vizState ||
    (itemId && !loading && data && JSON.parse(data.dashboardItem.vizState)) ||
    {};
  const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [title, setTitle] = useState(null);
  const finalTitle =
    title != null
      ? title
      : (itemId && !loading && data && data.dashboardItem.name) || 'New Chart';

  if (loading) {
    return <Spin />;
  }

  if (error) {
    return <Alert type="error" message={error.toString()} />;
  }

  return (
    <div>
      <TitleModal
        history={history}
        itemId={itemId}
        titleModalVisible={titleModalVisible}
        setTitleModalVisible={setTitleModalVisible}
        setAddingToDashboard={setAddingToDashboard}
        finalVizState={finalVizState}
        setTitle={setTitle}
        finalTitle={finalTitle}
      />
      <PageHeader
        noBorder={true}
        title={<Typography.Title level={4}>Chart</Typography.Title>}
        button={
          <Button
            key="button"
            type="primary"
            loading={addingToDashboard}
            disabled={!isQueryPresent(finalVizState.query || {})}
            onClick={() => setTitleModalVisible(true)}
          >
            {itemId ? 'Update' : 'Add to Dashboard'}
          </Button>
        }
      />
      <ExploreQueryBuilder vizState={finalVizState} setVizState={setVizState} />
    </div>
  );
});
export default ExplorePage;
