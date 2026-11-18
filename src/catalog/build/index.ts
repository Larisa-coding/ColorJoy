import type { PageGeometry, PageMeta } from '../types';
import { buildAnimal, buildPair, type AnimalOpts } from './animal';
import { sceneMakers, vehicleMakers } from './scenes';
import { moreMakers } from './scenes2';

const animals: Record<string, AnimalOpts> = {
  'cat-mur': { ear: 'pointy', tail: 'curl', nose: 'triangle', whiskers: true, cheeks: true, extras: ['bow'], simple: true },
  'cat-yarn': { ear: 'pointy', tail: 'curl', nose: 'triangle', whiskers: true, cheeks: true, prop: 'yarn', pose: 'side' },
  'cat-sleep': { ear: 'pointy', tail: 'curl', nose: 'triangle', whiskers: true, pose: 'sleep', paws: false },
  'pup-bim': { ear: 'floppy', tail: 'straight', nose: 'snout', cheeks: true, simple: true },
  'pup-run': { ear: 'floppy', tail: 'straight', nose: 'snout', pose: 'run' },
  'lion-cub': { ear: 'round', tail: 'straight', nose: 'triangle', extras: ['mane'] },
  'elephant-baby': { ear: 'floppy', tail: 'short', nose: 'dot', extras: ['trunk'], bodyRx: 1.3, head: 0.92 },
  'giraffe-spot': { ear: 'pointy', tail: 'straight', nose: 'dot', extras: ['neck', 'spots', 'ossicones'], head: 0.72 },
  'fox-sit': { ear: 'pointy', tail: 'big', nose: 'triangle', cheeks: true },
  'hedgehog-apple': { ear: 'round', tail: 'short', nose: 'dot', extras: ['spikes'], prop: 'apple' },
  'squirrel-nut': { ear: 'pointy', tail: 'big', nose: 'dot', prop: 'apple' },
  'cow-spots': { ear: 'floppy', tail: 'straight', nose: 'snout', extras: ['spots', 'horn'], simple: true },
  'pig-mud': { ear: 'floppy', tail: 'curl', nose: 'snout', cheeks: true, simple: true },
  'sheep-fluff': { ear: 'floppy', tail: 'short', nose: 'dot', extras: ['fluff'] },
  'bunny-carrot': { ear: 'bunny', tail: 'puff', nose: 'triangle', cheeks: true, prop: 'carrot' },
  'panda-bamboo': { ear: 'round', tail: 'short', nose: 'dot', extras: ['patches'], prop: 'bamboo' },
  'bear-honey': { ear: 'round', tail: 'short', nose: 'dot', cheeks: true, prop: 'honey' },
  'unicorn-cloud': { ear: 'pointy', tail: 'straight', nose: 'dot', extras: ['horn', 'mane'], prop: 'flower' },
  'magic-fox': { ear: 'pointy', tail: 'big', nose: 'triangle', extras: ['wings'], prop: 'star' },
  'monster-cute': { ear: 'round', tail: 'straight', nose: 'dot', extras: ['horn', 'spots'], cheeks: true, dress: 'night' },
};

export const buildGeometry = (meta: PageMeta): PageGeometry => {
  const animal = animals[meta.id];
  if (animal) return buildAnimal(meta, animal);
  if (meta.id === 'kitten-pair') {
    return buildPair(
      meta,
      'park',
      { prefix: 'a', ear: 'pointy', tail: 'curl', nose: 'triangle', whiskers: true, simple: true, sc: 0.62, ox: -78, oy: 16 },
      { prefix: 'b', ear: 'pointy', tail: 'curl', nose: 'triangle', whiskers: true, simple: true, sc: 0.58, ox: 86, oy: 28, facing: -1 },
    );
  }
  if (meta.id === 'bunny-family') {
    return buildPair(
      meta,
      'park',
      { prefix: 'a', ear: 'bunny', tail: 'puff', nose: 'triangle', cheeks: true, prop: 'carrot', sc: 0.78, ox: -48 },
      { prefix: 'b', ear: 'bunny', tail: 'puff', nose: 'dot', simple: true, sc: 0.46, ox: 108, oy: 36 },
    );
  }
  const maker = sceneMakers[meta.id] ?? vehicleMakers[meta.id] ?? moreMakers[meta.id];
  if (!maker) throw new Error(`Нет иллюстрации «${meta.title}» (${meta.id})`);
  return maker(meta);
};
