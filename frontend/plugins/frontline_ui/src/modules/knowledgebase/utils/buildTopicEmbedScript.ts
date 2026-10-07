import { REACT_APP_WIDGETS_URL } from '@/utils';

export const buildTopicEmbedScript = (topicId: string) => {
  const API = REACT_APP_WIDGETS_URL;
  return `<script>
    window.erxesSettings = {
      knowledgeBase: {
        topicId: ${JSON.stringify(topicId)},
      },
    };

    (function () {
      const script = document.createElement("script");
      script.src = "${API}/knowledgeBaseBundle.js";
      script.async = true;
      const entry = document.getElementsByTagName("script")[0];
      entry.parentNode.insertBefore(script, entry);
    })();
  </script>`;
};
