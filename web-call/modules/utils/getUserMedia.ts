interface MediaTrackConstraintsWithLabels extends MediaTrackConstraintSet {
  advanced?: MediaTrackConstraintSet[]
  label?: string
}

interface MediaStreamConstraintsWithLabels {
  audio?: boolean | MediaTrackConstraintsWithLabels
  peerIdentity?: string
  preferCurrentTab?: boolean
  video?: boolean | MediaTrackConstraintsWithLabels
}

/**
 * utility that basically has the same API as getUserMedia
 * but can accept a 'label' property on the audio and video
 * media track constraints that it will fallback to if it cannot
 * find the device id.
 */
export async function getUserMediaExtended(
  constraints?: MediaStreamConstraintsWithLabels
) {
  const devices = await navigator.mediaDevices.enumerateDevices()
  if (devices.filter((d) => d.label !== "").length === 0) {
    // request both audio and video together so we can only show
    // the user one prompt.
    await navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((ms) => {
        ms.getTracks().forEach((t) => t.stop())
      })
  }

  if (!constraints) return navigator.mediaDevices.getUserMedia()

  const { audio, peerIdentity, preferCurrentTab } = constraints

  const newContsraints: MediaStreamConstraints = {
    peerIdentity,
    preferCurrentTab,
  }

  if (typeof audio === "object") {
    const { label, deviceId, ...rest } = audio
    const foundDevice =
      devices.find((d) => d.deviceId === deviceId) ??
      devices.find((d) => d.label === label && d.kind === "audioinput")
    newContsraints.audio = { ...rest, deviceId: foundDevice?.deviceId }
  } else {
    newContsraints.audio = audio
  }

  return navigator.mediaDevices.getUserMedia(newContsraints)
}
