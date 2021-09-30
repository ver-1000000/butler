import level from 'level';
import { ScheduledTask } from 'node-cron';

interface Inmemory {
  startAt: Date | null;
  spent: number;
  wave: number;
  rest: boolean
}

/** ポモドーロの現在の状態を表すモデル。 */
export class PomodoroStatus {
  private store: level.LevelDB = level('.data/pomodoro');
  private inmemory: Inmemory   = { startAt: null, spent: 0, wave: 0, rest: true };
  /** `node-cron`のスケジュール。 jsonに書き込まずオンメモリで管理するため、強制終了で揮発する。 */
  private scheduleTask: ScheduledTask | null = null;

  constructor() {
    const read = () => new Promise<Inmemory>(resolve => {
      const stream = this.store.createReadStream();
      const buffer = {} as Inmemory;
      stream.on('data', chunk => Object.assign(buffer, { [chunk.key]: JSON.parse(chunk.value) }));
      stream.on('end', () => resolve(buffer));
    });
    read().then(inmemory => this.inmemory = inmemory);
  }

  /** ポモドーロタイマーが始動した時間。 */
  get startAt() {
    const startAt = this.inmemory.startAt;
    return startAt ? new Date(startAt) : null;
  }

  set startAt(startAt: Date | null) {
    this.inmemory.startAt = startAt;
    this.store.put('startAt', JSON.stringify(startAt));
  }

  /** ポモドーロタイマーが始動してから経過した時間(分)。 */
  get spent() {
    return this.inmemory.spent;
  }

  set spent(spent: number) {
    this.inmemory.spent = spent;
    this.store.put('spent', spent);
  }

  /** 何度目のポモドーロかの回数。 */
  get wave() {
    return this.inmemory.wave;
  }

  set wave(wave: number) {
    this.inmemory.wave = wave;
    this.store.put('wave', wave);
  }

  /** 現在休憩中のときtrueになる。 */
  get rest() {
    return this.inmemory.rest;
  }

  set rest(rest: boolean) {
    this.inmemory.rest = rest;
    this.store.put('rest', rest);
  }

  /** 設定されているcronのスケジュール。 */
  get task() {
    return this.scheduleTask;
  }

  set task(task: ScheduledTask | null) {
    this.scheduleTask = task;
  }

  /** デフォルト値に戻す。 */
  reset() {
    this.startAt = null;
    this.spent   = 0;
    this.wave    = 0;
    this.rest    = true;
    this.scheduleTask?.destroy();
  }
}
