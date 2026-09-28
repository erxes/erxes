import { IconTicket } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';
import { useState, type FormEvent } from 'react';

export const TicketFormInline = ({
  onSubmit,
}: {
  onSubmit: (payload: Record<string, string>) => void;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      'ticket:name': name.trim(),
      'ticket:description': description.trim(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1 mt-1">
        <IconTicket size={13} className="text-primary shrink-0" />
        Ticket info submitted
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2 w-full">
      <Input
        placeholder="Ticket name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="text-sm h-8"
        required
      />
      <Input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="text-sm h-8"
      />
      <Button
        type="submit"
        size="sm"
        className="h-7 text-xs self-start rounded-xl"
        disabled={!name.trim()}
      >
        <IconTicket size={13} />
        Submit
      </Button>
    </form>
  );
};
