// Look inside your utils file (e.g., ../lib/utils.ts)
export function readEmoji(url: string | undefined): string {
  if (!url) return 'fallback-placeholder-image-url';

  // Check if the backend returned the dead S3 bucket link
  if (url.includes('erxes.s3.amazonaws.com/icons/')) {
    // Extract the icon name (e.g., "grinning.svg")
    const iconName = url.split('/').pop();

    // Route it to a reliable fallback CDN or a local asset folder in your app
    return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${encodeURIComponent(
      iconName as string,
    )}`;
    // OR simply point to your local public folder:
    // return `/assets/icons/${iconName}`;
  }

  // Your original readImage fallback/upload prefixing logic:
  if (url.startsWith('http')) {
    return url;
  }

  return `${process.env.REACT_APP_API_URL}/uploads/${url}`;
}
