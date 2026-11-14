import { BODIES, type AvatarBody } from './bodies';
import { blendFace, EXPRESSIONS, type AvatarExpression } from './expressions';
import { eyeOffset, type Offset } from './eyefit';
import { liveliness, type Face } from './face';
import { blendPose, buildFrame, lerpLook, NO_LOOK, type BotFrame, type Look } from './frame';
import { SCALE, clamp, easeOutQuint, lerp } from './math';
import { STATES, type AvatarState, type Pose } from './poses';

const MORPH = 0.45;
const LOOK_MORPH = 0.24;

const progress = (now: number, since: number, span: number) =>
  easeOutQuint(clamp((now - since) / span));

const lerpOffset = (a: Offset, b: Offset, t: number) => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});

export class BotEngine {
  private current: AvatarState;
  private previous: AvatarState | null = null;
  private frozenStart: Pose | null = null;
  private since = 0;
  private previousSince = 0;
  private blinkAt = -10;
  private body: AvatarBody;
  private previousBody: AvatarBody;
  private bodyAt = -10;
  private face: AvatarExpression;
  private previousFace: AvatarExpression;
  private faceAt = -10;
  private look: Look = NO_LOOK;
  private previousLook: Look = NO_LOOK;
  private lookAt = -10;
  private lookMorph = LOOK_MORPH;

  constructor(state: AvatarState, body: AvatarBody, face: AvatarExpression) {
    this.current = state;
    this.body = body;
    this.previousBody = body;
    this.face = face;
    this.previousFace = face;
  }

  get state() {
    return this.current;
  }

  setBody(body: AvatarBody, now: number) {
    if (body === this.body) return;
    this.previousBody = this.body;
    this.body = body;
    this.bodyAt = now;
  }

  setFace(face: AvatarExpression, now: number) {
    if (face === this.face) return;
    this.previousFace = this.face;
    this.face = face;
    this.faceAt = now;
  }

  setLook(look: Look | null, now: number, morph = LOOK_MORPH) {
    if (look && !Number.isFinite(look.yaw + look.pitch + look.mix + look.wander)) return;
    this.previousLook = this.lookAtTime(now);
    this.look = look ?? NO_LOOK;
    this.lookAt = now;
    this.lookMorph = morph;
  }

  setState(state: AvatarState, now: number) {
    if (state === this.current) return;
    const fading = this.previous !== null && now - this.since < STATES[this.current].morph;
    this.frozenStart = fading ? this.composed(now) : null;
    this.previous = this.current;
    this.previousSince = this.since;
    this.current = state;
    this.since = now;

    if (STATES[state].blinkIn) this.blinkAt = now;
  }

  reset(state: AvatarState, now: number) {
    this.current = state;
    this.previous = null;
    this.frozenStart = null;
    this.since = now;
    this.previousSince = now;
    this.blinkAt = -10;
  }

  private lookAtTime(now: number) {
    return lerpLook(this.previousLook, this.look, progress(now, this.lookAt, this.lookMorph));
  }

  private radiiAt(now: number) {
    const t = progress(now, this.bodyAt, MORPH);
    const from = BODIES[this.previousBody];
    const to = BODIES[this.body];

    return t >= 1 ? to : to.map((r, i) => lerp(from[i] ?? r, r, t));
  }

  private faceAtTime(now: number) {
    const t = progress(now, this.faceAt, MORPH);
    const to = EXPRESSIONS[this.face];

    return t >= 1 ? to : blendFace(EXPRESSIONS[this.previousFace], to, t);
  }

  private posed(state: AvatarState, t: number, radii: number[], face: Face): Pose {
    const def = STATES[state];
    const pose = def.pose(t);

    return {
      ...pose,
      sil: def.ownBody ? pose.sil : { ...pose.sil, radii },
      ...(def.ownFace ? {} : face),
    };
  }

  private eyeShift(now: number, state: AvatarState): Offset {
    const at = (body: AvatarBody) =>
      lerpOffset(
        eyeOffset(state, body, this.previousFace),
        eyeOffset(state, body, this.face),
        progress(now, this.faceAt, MORPH),
      );

    return lerpOffset(at(this.previousBody), at(this.body), progress(now, this.bodyAt, MORPH));
  }

  private start(now: number, radii: number[], face: Face) {
    if (this.frozenStart) return this.frozenStart;

    if (!this.previous) return null;

    return this.posed(this.previous, Math.max(0, now - this.previousSince), radii, face);
  }

  private composed(now: number): Pose {
    const radii = this.radiiAt(now);
    const face = this.faceAtTime(now);
    const pose = this.posed(this.current, Math.max(0, now - this.since), radii, face);
    const morph = STATES[this.current].morph;
    const start = now - this.since < morph ? this.start(now, radii, face) : null;

    return start ? blendPose(start, pose, progress(now, this.since, morph)) : pose;
  }

  sample(now: number): BotFrame {
    const pose = this.composed(now);
    const morph = STATES[this.current].morph;
    const shift = this.eyeShift(now, this.current);

    const eyeShift =
      this.previous && now - this.since < morph
        ? lerpOffset(this.eyeShift(now, this.previous), shift, progress(now, this.since, morph))
        : shift;

    const alive = pose.eyeAlpha > 0.01;
    const look = this.lookAtTime(now);
    const life = liveliness(now, alive ? look.wander : 0, alive);
    const forced = clamp((now - this.blinkAt) / 0.2);

    return buildFrame({
      pose,
      gaze: {
        yaw: lerp(pose.gaze.yaw, look.yaw, look.mix) + life.dYaw,
        pitch: lerp(pose.gaze.pitch, look.pitch, look.mix) + life.dPitch,
        roll: pose.gaze.roll + life.dRoll,
      },
      lid: Math.min(life.lid, forced < 1 ? Math.abs(forced * 2 - 1) : 1),
      offX: pose.offX + life.driftX,
      offY: pose.offY + life.driftY,
      breath: life.breath,
      eyeShift,
      scale: SCALE,
    });
  }
}
