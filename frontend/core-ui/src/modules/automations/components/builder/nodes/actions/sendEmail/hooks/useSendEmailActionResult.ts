export const useSendEmailActionResult = () => {
  const getLabelColor = (response: any) => {
    if (response?.messageId) {
      return 'success';
    }
    if (response?.error) {
      return 'destructive';
    }
    return 'secondary';
  };

  const getLabelText = (response: any) => {
    if (response.error) {
      return typeof response?.error === 'object'
        ? JSON.stringify(response.error || {})
        : `${response?.error}`;
    }

    if (response.messageId) {
      return 'Sent';
    }

    return '';
  };

  return { getLabelColor, getLabelText };
};
