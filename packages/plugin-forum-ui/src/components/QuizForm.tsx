import React, { useState } from 'react';
import { useSearchParam } from '../hooks';
import { useQuery, useLazyQuery } from 'react-apollo';
import gql from 'graphql-tag';
import CategorySelect from '../containers/CategorySelect';
import CompanySelect from './CompanySelect';
import { Link } from 'react-router-dom';

export const QUIZ_STATES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type QuizState = typeof QUIZ_STATES[number];

const QUERY_TAGS = gql`
  query Tags {
    tags(type: "forum:post") {
      _id
      colorCode
      name
    }
  }
`;

const QUERY_COMPANY = gql`
  query CompanyDetail($id: String!) {
    companyDetail(_id: $id) {
      _id
      primaryEmail
      primaryName
    }
  }
`;

const ShowCompany: React.FC<{ companyId?: string }> = ({ companyId }) => {
  const { loading, error, data } = useQuery(QUERY_COMPANY, {
    variables: { id: companyId }
  });

  if (!companyId) return <span>No company</span>;

  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error: {error.message}</span>;

  const {
    companyDetail: { primaryEmail, primaryName }
  } = data;

  return (
    <span>
      {primaryName + ' - ' || ''} {primaryEmail || ''}
    </span>
  );
};

type Props = {
  quiz?: {
    _id: any;

    postId?: string | null;
    companyId?: string | null;
    tagIds?: string[] | null;
    categoryId?: string | null;

    name?: string | null;
    description?: string | null;

    isLocked: boolean;
  };
  onSubmit?: (val: any) => any;
};

export const timeDuractionUnits = ['days', 'weeks', 'months', 'years'] as const;
export type TimeDurationUnit = typeof timeDuractionUnits[number];

const RelatedPost: React.FC<{ postId: string }> = ({ postId }) => {
  const { data, loading, error } = useQuery(
    gql`
      query ForumPost($id: ID!) {
        forumPost(_id: $id) {
          _id
          title
        }
      }
    `,
    {
      variables: { id: postId }
    }
  );

  let link: any = 'No post';
  if (loading) link = 'Loading...';
  if (error) link = `Error: ${error.message}`;
  if (data)
    link = <Link to={`/forums/posts/${postId}`}>{data.forumPost.title}</Link>;

  return <div>Related post: {link}</div>;
};

const SubscriptionProductForm: React.FC<Props> = ({ quiz, onSubmit }) => {
  const [postId] = useSearchParam('postId');
  const [name, setName] = useState(quiz?.name || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [categoryId, setCategoryId] = useState(quiz?.categoryId || '');
  const [companyId, setCompanyId] = useState(quiz?.companyId || '');
  const [showCompanySelect, setShowCompanySelect] = useState(false);

  const initialCheckedTagIds = {};
  quiz?.tagIds?.forEach(id => {
    initialCheckedTagIds[id] = true;
  });

  const [checkedTagIds, setCheckedTagIds] = useState(initialCheckedTagIds);

  const tagsQuery = useQuery(QUERY_TAGS);

  const _onSubmit = e => {
    e.preventDefault();
    if (!onSubmit) return;
    onSubmit({
      postId: postId || null,
      companyId: companyId || null,
      categoryId: categoryId || null,
      tagIds: Object.entries(checkedTagIds)
        .filter(([_, checked]) => checked)
        .map(([id]) => id),
      name,
      description
    });
  };

  return (
    <form onSubmit={_onSubmit}>
      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </label>
      <br />
      <label>
        Description
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </label>

      <br />
      <label>
        Category
        <CategorySelect value={categoryId} onChange={setCategoryId} />
      </label>

      <br />

      <label>
        Company: <ShowCompany companyId={companyId} />{' '}
        <button type="button" onClick={() => setShowCompanySelect(true)}>
          Select
        </button>
        <CompanySelect
          show={showCompanySelect}
          onCancel={() => setShowCompanySelect(false)}
          onChoose={chosenId => {
            setCompanyId(chosenId);
            setShowCompanySelect(false);
          }}
        />
      </label>

      {postId && <RelatedPost postId={postId} />}

      <div>
        <h5>Tags</h5>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {tagsQuery.data?.tags?.map(tag => (
            <div style={{ margin: 5 }} key={tag._id}>
              <input
                checked={!!checkedTagIds[tag._id]}
                onChange={e => {
                  const checked = e.target.checked;
                  setCheckedTagIds(prev => {
                    const next = { ...prev };
                    next[tag._id] = checked;
                    return next;
                  });
                }}
                type="checkbox"
                id={`tcb-${tag._id}`}
              />{' '}
              <label style={{ userSelect: 'none' }} htmlFor={`tcb-${tag._id}`}>
                {tag.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <input type="submit" value="Submit" />
    </form>
  );
};

export default SubscriptionProductForm;
