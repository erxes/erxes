import { useQuery, useMutation } from '@apollo/client';
import { USER_WIDGETS } from '../graphql/queries/queries';
import { SAVE_WIDGET, UPDATE_WIDGET, DELETE_WIDGET } from '../graphql/mutations/mutations';

export const useSavedWidgets = () => {
  const { data, loading, refetch } = useQuery(USER_WIDGETS);
  const [saveWidgetMut] = useMutation(SAVE_WIDGET);
  const [updateWidgetMut] = useMutation(UPDATE_WIDGET);
  const [deleteWidgetMut] = useMutation(DELETE_WIDGET);

  const saveWidget = async (widget: any) => {
    const res = await saveWidgetMut({ variables: { widget } });
    refetch();
    return res.data.saveWidget;
  };

  const updateWidget = async (_id: string, widget: any) => {
    const res = await updateWidgetMut({ variables: { _id, widget } });
    refetch();
    return res.data.updateWidget;
  };

  const deleteWidget = async (_id: string) => {
    await deleteWidgetMut({ variables: { _id } });
    refetch();
  };

  return {
    widgets: data?.userWidgets || [],
    loading,
    saveWidget,
    updateWidget,
    deleteWidget,
    refetch,
  };
};