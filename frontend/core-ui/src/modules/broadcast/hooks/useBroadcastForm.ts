import { useForm } from 'react-hook-form';

const useBroadcastForm = () => {
  const form = useForm({
    defaultValues: {
      targetType: 'tag',
    },
  });

  return { form };
};

export { useBroadcastForm };
