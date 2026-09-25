import { IconAlertTriangle, IconInfoCircle, IconX } from '@tabler/icons-react';
import {
  Alert,
  Attachments,
  Button,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TFacebookPostImages } from '../hooks/useFacebookPostImages';

export const FacebookPostImagesField = ({
  images,
}: {
  images: TFacebookPostImages;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <>
      <Attachments.Root
        initialAttachments={images.images}
        onSave={images.setImages}
        confirmRemove={() => true}
      >
        <Attachments.Preview heading={t('post-images')} />
      </Attachments.Root>

      {!images.isFull && (
        <Dropzone {...images.upload}>
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      )}

      <Alert>
        <IconInfoCircle />
        <Alert.Description>{t('post-images-help')}</Alert.Description>
      </Alert>

      {images.unstorableNames.map((name) => (
        <Alert key={name} variant="destructive">
          <IconAlertTriangle />
          <Alert.Title className="break-all">{name}</Alert.Title>
          <Alert.Description>{t('post-images-bad-filename')}</Alert.Description>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('remove')}
            className="absolute right-1 top-1 size-6"
            onClick={() => images.dismissUnstorable(name)}
          >
            <IconX size={12} />
          </Button>
        </Alert>
      ))}
    </>
  );
};
