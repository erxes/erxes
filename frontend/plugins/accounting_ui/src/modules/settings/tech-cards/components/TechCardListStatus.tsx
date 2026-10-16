import { Button, Empty } from 'erxes-ui';

export const TechCardListStatus = ({
  error,
  retry,
}: {
  error?: Error;
  retry: () => void;
}) => (
  <Empty role={error ? 'alert' : 'status'}>
    <Empty.Header>
      <Empty.Description>
        {error ? 'Жагсаалтыг ачаалж чадсангүй.' : 'Тохирох бүртгэл алга.'}
      </Empty.Description>
    </Empty.Header>
    {error && (
      <Empty.Content>
        <Button type="button" variant="secondary" onClick={retry}>
          Дахин оролдох
        </Button>
      </Empty.Content>
    )}
  </Empty>
);
