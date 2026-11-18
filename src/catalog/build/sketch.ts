import { circle, cloud, ellipse, finalize, rect, star } from '../geometry';
import type { Decor, PageGeometry, PageMeta, Pt, RegionInput } from '../types';
import { strokeFor } from '../types';

export class Sketch {
  readonly regions: RegionInput[] = [];
  readonly decors: Decor[] = [];

  add(id: string, name: string, points: Pt[]): this {
    this.regions.push({ id, name, points });
    return this;
  }

  decor(points: Pt[], width?: number): this {
    this.decors.push({ points, width });
    return this;
  }

  dress(kind: 'plain' | 'park' | 'sea' | 'space' | 'room' | 'snow' | 'night'): this {
    this.add('sky', kind === 'room' ? 'Стена' : kind === 'sea' ? 'Небо' : 'Фон', rect(0, 0, 400, 400));
    if (kind === 'plain') return this;
    if (kind === 'space' || kind === 'night') {
      this.add('moon', 'Луна', circle(328, 68, kind === 'night' ? 26 : 30));
      this.add('star-a', 'Звезда', star(62, 64, 18, 8));
      this.add('star-b', 'Звёздочка', star(118, 108, 12, 5));
      this.add('star-c', 'Искра', star(250, 48, 10, 4));
      if (kind === 'night') this.add('ground', 'Земля', ellipse(200, 392, 210, 42));
      return this;
    }
    if (kind === 'sea') {
      this.add('water', 'Вода', rect(0, 168, 400, 232));
      this.add('sand', 'Песок', ellipse(200, 378, 210, 36));
      this.add('bubble-a', 'Пузырь', circle(78, 230, 12));
      this.add('bubble-b', 'Пузырь', circle(318, 210, 9));
      return this;
    }
    if (kind === 'room') {
      this.add('floor', 'Пол', rect(0, 286, 400, 114));
      this.add('window', 'Окно', rect(300, 48, 70, 78));
      this.add('rug', 'Коврик', ellipse(150, 340, 70, 22));
      return this;
    }
    if (kind === 'snow') {
      this.add('ground', 'Снег', ellipse(200, 390, 220, 46));
      this.add('flake-a', 'Снежинка', star(70, 70, 14, 6));
      this.add('flake-b', 'Снежинка', star(330, 110, 11, 5));
      return this;
    }
    this.add('ground', 'Земля', ellipse(200, 392, 220, 48));
    this.add('sun', 'Солнце', circle(338, 62, 30));
    this.add('cloud', 'Облако', cloud(86, 74, 0.95));
    return this;
  }

  done(meta: PageMeta): PageGeometry {
    return {
      strokeWidth: strokeFor(meta.difficulty),
      regions: finalize(this.regions),
      decors: this.decors,
    };
  }
}
