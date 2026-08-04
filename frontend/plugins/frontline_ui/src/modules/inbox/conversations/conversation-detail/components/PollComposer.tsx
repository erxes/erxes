import { IconChartBar, IconPlus, IconX } from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Input,
  Label,
  Select,
  Spinner,
  Switch,
  toast,
} from 'erxes-ui';
import { useState } from 'react';

export type PollDraft = {
  question: string;
  options: string[];
  duration: number; // hours
  allowMultiselect: boolean;
};

// Discord caps polls at 10 answers / 32-day duration; mirror those limits here.
const MAX_OPTIONS = 10;
const DURATIONS: { label: string; value: number }[] = [
  { label: '1 hour', value: 1 },
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: '1 day', value: 24 },
  { label: '3 days', value: 72 },
  { label: '7 days', value: 168 },
];

// Options carry a stable id so React keys survive add/remove without relying on
// the array index.
let optionIdSeq = 0;
/** Create a blank poll option with a stable id. */
const makeOption = () => {
  optionIdSeq += 1;
  return { id: `opt-${optionIdSeq}`, value: '' };
};

/** Composer for creating a native (Discord) poll. */
export const PollComposer = ({
  onSubmit,
  loading,
  disabled,
}: {
  // Resolve `true` when the poll was sent, so the dialog can close + reset.
  onSubmit: (poll: PollDraft) => Promise<boolean>;
  loading?: boolean;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(() => [makeOption(), makeOption()]);
  const [duration, setDuration] = useState(24);
  const [allowMultiselect, setAllowMultiselect] = useState(false);

  /** Reset the composer back to its empty state. */
  const reset = () => {
    setQuestion('');
    setOptions([makeOption(), makeOption()]);
    setDuration(24);
    setAllowMultiselect(false);
  };

  /** Update the value of the option at the given index. */
  const setOption = (index: number, value: string) =>
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, value } : o)),
    );

  /** Append a blank option, up to the max allowed. */
  const addOption = () =>
    setOptions((prev) =>
      prev.length < MAX_OPTIONS ? [...prev, makeOption()] : prev,
    );

  /** Remove the option at the given index, keeping at least two. */
  const removeOption = (index: number) =>
    setOptions((prev) =>
      prev.length > 2 ? prev.filter((_, i) => i !== index) : prev,
    );

  const trimmedOptions = options.map((o) => o.value.trim()).filter(Boolean);
  const canSubmit = question.trim().length > 0 && trimmedOptions.length >= 2;

  /** Validate and submit the poll. */
  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({
        title: 'Add a question and at least 2 options',
        variant: 'destructive',
      });
      return;
    }

    const ok = await onSubmit({
      question: question.trim(),
      options: trimmedOptions,
      duration,
      allowMultiselect,
    });

    if (ok) {
      setOpen(false);
      reset();
    }
  };

  return (
    // skipcq: JS-0415
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Create poll"
        >
          <IconChartBar className="h-4 w-4" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>Create poll</Dialog.Title>
          <Dialog.Description className="sr-only">
            Compose a poll to post to the Discord channel.
          </Dialog.Description>
        </Dialog.Header>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="poll-question">Question</Label>
            <Input
              id="poll-question"
              value={question}
              maxLength={300}
              placeholder="Ask something…"
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <Input
                  value={option.value}
                  maxLength={55}
                  placeholder={`Option ${index + 1}`}
                  onChange={(e) => setOption(index, e.target.value)}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground"
                    onClick={() => removeOption(index)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < MAX_OPTIONS && (
              <Button
                variant="ghost"
                size="sm"
                className="w-fit text-muted-foreground"
                onClick={addOption}
              >
                <IconPlus className="h-4 w-4" /> Add option
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="poll-duration">Duration</Label>
            <Select
              value={String(duration)}
              onValueChange={(v) => setDuration(Number(v))}
            >
              <Select.Trigger id="poll-duration" className="w-40">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {DURATIONS.map((d) => (
                  <Select.Item key={d.value} value={String(d.value)}>
                    {d.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="poll-multiselect">Allow multiple answers</Label>
            <Switch
              id="poll-multiselect"
              checked={allowMultiselect}
              onCheckedChange={setAllowMultiselect}
            />
          </div>
        </div>

        <Dialog.Footer>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
            {loading && <Spinner size="sm" />}
            Create poll
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
