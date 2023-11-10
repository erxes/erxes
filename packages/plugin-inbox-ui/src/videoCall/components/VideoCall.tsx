import { loadDynamicComponent } from '@erxes/ui/src/utils/core';

const VideoCall = (props: any) => {
  return loadDynamicComponent('videoCall', props);
};

export default VideoCall;
