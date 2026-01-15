import { useState } from 'react';
import { Tabs, Button } from 'erxes-ui';

interface PostPreviewProps {
  content: string;
}

export const PostPreview = ({ content }: PostPreviewProps) => {
  const [previewDevice, setPreviewDevice] = useState<
    'desktop' | 'tablet' | 'mobile'
  >('desktop');

  const deviceDims =
    previewDevice === 'desktop'
      ? { width: 1024, height: 768 }
      : previewDevice === 'tablet'
      ? { width: 768, height: 1024 }
      : { width: 375, height: 667 };

  return (
    <div className="mt-6">
      <div className="mb-4">
        <Tabs
          value={previewDevice}
          onValueChange={(v) =>
            setPreviewDevice(v as 'desktop' | 'tablet' | 'mobile')
          }
        >
          <Tabs.List>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Tabs.Trigger value="desktop">Desktop</Tabs.Trigger>
              <Tabs.Trigger value="tablet">Tablet</Tabs.Trigger>
              <Tabs.Trigger value="mobile">Mobile</Tabs.Trigger>
            </div>
          </Tabs.List>
        </Tabs>
        <div
          className="rounded-[36px] bg-primary relative shadow-inner"
          style={{
            width: '100%',
            maxWidth: deviceDims.width,
            aspectRatio: `${deviceDims.width} / ${deviceDims.height}`,
          }}
        >
          <div className="absolute inset-4 rounded-[28px] p-4 overflow-hidden">
            <div
              className="prose prose-sm max-w-none mt-2 h-44 overflow-auto"
              dangerouslySetInnerHTML={{
                __html: content || '',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
