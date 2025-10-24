import { useMutation } from '@apollo/client';
import { IconUpload } from '@tabler/icons-react';
import {
  Button,
  Editor,
  Form,
  IAttachment,
  Input,
  IPdfAttachment,
  MultipleSelector,
  ScrollArea,
  Select,
  Sheet,
  Switch,
  Textarea,
  Upload,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { REACTIONS } from '../constants';
import { ADD_ARTICLE, EDIT_ARTICLE } from '../graphql/mutations';
import { ARTICLES } from '../graphql/queries';
import { useArticles } from '../hooks/useArticles';

interface Article {
  _id: string;
  code: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  isPrivate?: boolean;
  reactionChoices?: string[];
  image?: IAttachment;
  attachments?: IAttachment[];
  pdfAttachment?: IPdfAttachment;
  categoryId: string;
}

interface ArticleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  article?: Article;
  categoryId: string;
}

interface ArticleFormData {
  campaign: string;
  status: string;
  isPrivate: boolean;
  reactionChoices: string[];
  image?: IAttachment;
  attachments: IAttachment[];
  pdfAttachment?: IPdfAttachment;
}

export function ArticleDrawer({
  isOpen,
  onClose,
  article,
  categoryId,
}: ArticleDrawerProps) {
  const isEditing = !!article;
  const { refetch } = useArticles({
    categoryIds: [categoryId],
  });
  const form = useForm<ArticleFormData>({
    defaultValues: {
      campaign: '',
      status: 'draft',
      isPrivate: false,
      reactionChoices: [],
      image: undefined,
      attachments: [],
      pdfAttachment: undefined,
    },
  });

  useEffect(() => {
    if (article) {
      form.reset({
        code: article.code || '',
        title: article.title || '',
        summary: article.summary || '',
        content: article.content || '',
        status: article.status || 'draft',
        isPrivate: article.isPrivate || false,
        reactionChoices: article.reactionChoices || [],
        image: article.image,
        attachments: article.attachments || [],
        pdfAttachment: article.pdfAttachment,
      });
    } else {
      form.reset({
        code: '',
        title: '',
        summary: '',
        content: '',
        status: 'draft',
        isPrivate: false,
        reactionChoices: [],
        image: undefined,
        attachments: [],
        pdfAttachment: undefined,
      });
    }
  }, [article, form]);

  const [addArticle, { loading: adding }] = useMutation(ADD_ARTICLE, {
    refetchQueries: [{ query: ARTICLES }],
    onCompleted: () => {
      onClose();
      form.reset();
      refetch();
    },
  });

  const [editArticle, { loading: editing }] = useMutation(EDIT_ARTICLE, {
    refetchQueries: [{ query: ARTICLES }],
    onCompleted: () => {
      onClose();
      form.reset();
      refetch();
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    if (isEditing && article) {
      editArticle({
        variables: {
          _id: article._id,
          input: {
            ...data,
            categoryId: categoryId || article.categoryId,
          },
        },
      });
    } else {
      addArticle({
        variables: {
          input: {
            ...data,
            categoryId,
          },
        },
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View
        className="sm:max-w-lg p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full overflow-hidden"
          >
            <Sheet.Header className="border-b gap-3">
              <Sheet.Title>
                {isEditing ? 'Edit Voucher' : 'New Voucher'}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="flex-auto overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Form.Field
                    control={form.control}
                    name="campaign"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Code</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder="Enter campaign" />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Owner type</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder="Select Status" />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value="draft">Customer</Select.Item>
                              <Select.Item value="publish">Company</Select.Item>
                              <Select.Item value="archived">
                                Team member
                              </Select.Item>
                              <Select.Item value="scheduled">
                                Clientportal user
                              </Select.Item>
                            </Select.Content>
                          </Select>
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="reactionChoices"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Reaction Choices</Form.Label>
                        <Form.Control>
                          <MultipleSelector
                            options={REACTIONS}
                            value={
                              field.value?.map((choice) => ({
                                value: choice,
                                label:
                                  REACTIONS.find(
                                    (reaction) => reaction.value === choice,
                                  )?.label || '',
                              })) || []
                            }
                            onChange={(value) => {
                              field.onChange(value.map((item) => item.value));
                            }}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              </ScrollArea>
            </Sheet.Content>

            <Sheet.Footer className="flex justify-end flex-shrink-0 p-2.5 gap-1 bg-muted">
              <Button
                type="button"
                variant="ghost"
                className="bg-background hover:bg-background/90"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
