import { TagsSelect, useCompaniesEdit } from 'ui-modules';
import { toast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';

export const TagsField = ({
  _id,
  tagType,
  selected,
}: {
  _id: string;
  tagType: string;
  selected: string[];
}) => {
  const { companiesEdit } = useCompaniesEdit();
  return (
    <TagsSelect
      type={tagType}
      value={selected}
      mode="multiple"
      onValueChange={(tagIds: string[]) => {
        companiesEdit({
          variables: { _id, tagIds },
          onError: (e: ApolloError) => {
            toast({
              title: 'Error',
              description: e.message,
              variant: 'destructive',
            });
          },
        });
      }}
    />
  );
};
