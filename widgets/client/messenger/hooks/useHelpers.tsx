import { MESSAGE_TYPES } from "../constants";
import uploadHandler from "../../uploadHandler";
import { useConfig } from "../context/Config";
import { useMessage } from "../context/Message";

function useHelpers() {
  const { sendMessage } = useMessage();
  const { setIsAttachingFile } = useConfig();

  const sendFiles = (files: FileList) => {
    uploadHandler({
      files,
      beforeUpload() {
        setIsAttachingFile(true);
      },
      // upload to server
      afterUpload({ response, fileInfo }: { response: any; fileInfo: any }) {
        setIsAttachingFile(false);

        const attachment = { url: response, ...fileInfo };

        // send message with attachment
        sendMessage(MESSAGE_TYPES.TEXT, "This message has an attachment", [
          attachment,
        ]);
      },

      onError: (message) => {
        alert(message);
        setIsAttachingFile(false);
      },
    });
  };

  return { sendFiles };
}

export default useHelpers;
