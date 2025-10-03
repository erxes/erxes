import { Button, Form, Sheet } from 'erxes-ui';
import { IconGitBranch, IconPlus } from '@tabler/icons-react';

import { PipelineHotKeyScope } from '@/deals/types/pipelines';
import React from 'react';
import { usePipelineForm } from '@/deals/boards/hooks/usePipelineForm';
import { usePreviousHotkeyScope } from 'erxes-ui';
import { useScopedHotkeys } from 'erxes-ui';
import { useSetHotkeyScope } from 'erxes-ui';
import { useState } from 'react';

export function PipelineFormBar() {
  const {
    methods,
    // methods: { handleSubmit },
  } = usePipelineForm();
  const [open, setOpen] = useState<boolean>(false);

  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      PipelineHotKeyScope.PipelineAddSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(PipelineHotKeyScope.PipelineSettingsPage);
    setOpen(false);
  };

  useScopedHotkeys(
    `c`,
    () => onOpen(),
    PipelineHotKeyScope.PipelineSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    PipelineHotKeyScope.PipelineAddSheet,
  );

  return (
    <div className="ml-auto flex items-center gap-3">
      <Sheet onOpenChange={(open) => (open ? onOpen() : onClose())} open={open}>
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus /> Add Pipeline
          </Button>
        </Sheet.Trigger>
        <Sheet.View
          className="p-0"
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <Form {...methods}>
            <form
              // onSubmit={handleSubmit(submitHandler)}
              className=" flex flex-col gap-0 w-full h-full"
            >
              <Sheet.Header>
                <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
                  <IconGitBranch size={16} />
                  Add Pipeline
                </Sheet.Title>
                <Sheet.Close />
              </Sheet.Header>
              <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
                {/* <PipelineForm /> */}
              </Sheet.Content>
              <Sheet.Footer>
                <Button variant={'ghost'} onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                {/* <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Create'}
              </Button> */}
              </Sheet.Footer>
            </form>
          </Form>
        </Sheet.View>
      </Sheet>
    </div>
  );
}
