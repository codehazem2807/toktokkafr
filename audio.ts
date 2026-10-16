import { Scene, Sound } from '@babylonjs/core';

// استيراد الملفات من نفس المسار — Vite هيتعامل معاها كـ URLs
import track1 from './1.mp3?url';
import track2 from './2.mp3?url';
import track3 from './3.mp3?url';
import track4 from './4.mp3?url';
import track5 from './5.mp3?url';

const TRACKS = [track1, track2, track3, track4, track5];

export class AudioManager {
  private sounds: Sound[] = [];
  private currentIndex = -1;

  constructor(scene: Scene) {
    TRACKS.forEach((url, i) => {
      const s = new Sound(
        `track_${i}`,
        url,
        scene,
        null,
        { loop: false, volume: 0.6, autoplay: false }
      );
      this.sounds.push(s);
    });
  }

  playTrack(index: number): void {
    if (index < 0 || index >= this.sounds.length) return;
    this.stopCurrent();
    this.currentIndex = index;
    this.sounds[index].play();
  }

  playNext(): void {
    this.playTrack((this.currentIndex + 1) % this.sounds.length);
  }

  stopCurrent(): void {
    if (this.currentIndex >= 0) {
      this.sounds[this.currentIndex].stop();
      this.currentIndex = -1;
    }
  }

  dispose(): void {
    this.sounds.forEach(s => s.dispose());
    this.sounds = [];
  }
}
