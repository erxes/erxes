import type { Editor as TiptapEditor } from '@tiptap/core';
import { Form } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { BroadcastEmailEditor } from '../BroadcastEmailEditor';
import { BroadcastInsertTemplate } from '../BroadcastInsertTemplate';

export const BroadcastEmailPreview = () => {
  const { control } = useFormContext();

  const [editor, setEditor] = useState<TiptapEditor>();

  return (
    <div className="h-full flex flex-col gap-3">
      {editor && (
        <div className="flex justify-end">
          <BroadcastInsertTemplate editor={editor} />
        </div>
      )}
      <div className="h-full overflow-y-auto">
        <Form.Field
          name="email.contentJson"
          control={control}
          rules={{ required: 'Content is required' }}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <BroadcastEmailEditor
                  contentJson={field.value}
                  onChange={field.onChange}
                  onCreate={setEditor}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>
    </div>
  );
};
