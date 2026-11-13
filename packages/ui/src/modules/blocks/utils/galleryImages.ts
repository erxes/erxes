import { z } from 'zod';
import { jsonOf } from 'erxes-ui/utils/json';

const galleryImageSchema = z.object({ url: z.string(), caption: z.string().optional() });

export type GalleryImage = z.infer<typeof galleryImageSchema>;

/** A gallery block stores its images as a JSON string prop; anything unreadable is no images. */
export const parseGalleryImages = (raw: string): GalleryImage[] => {
  return jsonOf(z.array(galleryImageSchema)).safeParse(raw).data ?? [];
};

/** The stored column count, kept between 2 and 4; 3 when unset. */
export const parseGalleryColumns = (raw: string) =>
  Math.max(2, Math.min(4, Number.parseInt(raw, 10) || 3));

/** A key per image that stays put when other images are removed; repeated urls get a counter. */
export const keyGalleryImages = (images: GalleryImage[]) => {
  const seen = new Map<string, number>();

  return images.map((image) => {
    const count = seen.get(image.url) ?? 0;
    seen.set(image.url, count + 1);

    return { image, key: count ? `${image.url}#${count}` : image.url };
  });
};
