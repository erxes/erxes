import { useTemplateCategoryDetail } from '@/templates/hooks/useTemplateCategoryDetail';
import { IconLoader2 } from '@tabler/icons-react';
import {
  Sheet,
  useQueryState,
  useToast
} from 'erxes-ui';
import { TemplateCategoryForm } from './TemplateCategoryForm';

export const TemplateCategoryDetailSheet = () => {
  const [categoryId, setCategoryId] = useQueryState<string>('categoryId');

  const { toast } = useToast();

  const { categoryDetail, loading } = useTemplateCategoryDetail(categoryId || undefined);

  const setOpen = (newCategoryId: string | null) => {
    setCategoryId(newCategoryId);
  };

  return (
    <Sheet
      open={!!categoryId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null);
        }
      }}
    >
      <Sheet.View className="w-[50%] md:w-[50%] lg:w-[50%]">
        {loading ? (
          <div className="flex flex-1 justify-center items-center p-5 min-h-[200px] text-muted-foreground">
            <IconLoader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : (
          <>
            <Sheet.Header>
              <Sheet.Title>Edit Category</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <TemplateCategoryForm
              category={categoryDetail}
              onCompleted={() => {
                toast({
                  title: 'Category updated successfully',
                  variant: 'success',
                });
                setOpen(null);
              }}
              onClose={() => setOpen(null)}
            />
          </>
        )}
      </Sheet.View>
    </Sheet>
  );
};
