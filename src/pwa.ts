import { registerSW } from 'virtual:pwa-register';

export const initPwa = (onUpdate: (apply: () => void) => void) => {
  const update = registerSW({
    onNeedRefresh() {
      onUpdate(() => {
        void update(true);
      });
    },
  });
};
