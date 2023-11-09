import { loadDynamicComponent } from '@erxes/ui/src/utils/core';

const VideoCall = (props: any) => {
  console.log('propssssss', props);
  return loadDynamicComponent('videoCall', props);
};

export default VideoCall;
