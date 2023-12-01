import { graphql } from '@apollo/client/react/hoc';

const ChipText = (props: any) => {
  const { query } = props;

  if (query.loading) {
    return '-';
  }

  const brand = query.brandDetail;
  const channel = query.channelDetail;
  const tag = query.tagDetail;
  const segment = query.segmentDetail;
  const form = query.formDetail;
  const forum = query.forumCategory;
  const branch = query.branchDetail;
  const department = query.departmentDetail;
  const unit = query.unitDetail;
  const productCategory = query.productCategoryDetail;

  return (
    (brand && brand.name) ||
    (channel && channel.name) ||
    (tag && tag.name) ||
    (segment && segment.name) ||
    (form && form.title) ||
    (forum && forum.name) ||
    (branch && branch.title) ||
    (department && department.title) ||
    (unit && unit.title) ||
    (productCategory && `${productCategory.code} - ${productCategory.name}`)
  );
};

const createChipText = (query, id) => {
  return graphql(query, {
    name: 'query',
    options: () => {
      return {
        variables: {
          id
        }
      };
    }
  })(ChipText);
};

export default createChipText;
