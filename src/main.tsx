import { createRoot } from 'react-dom/client';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import { App } from '@/app/App';
import '@/styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Нет корневого элемента');

const pinViewport = () => {
  document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`);
};
pinViewport();
window.addEventListener('resize', pinViewport);
window.addEventListener('orientationchange', () => window.setTimeout(pinViewport, 350));

document.addEventListener('touchmove', (event) => {
  const target = event.target;
  if (target instanceof Element && target.closest('.screen, .dock, input, textarea, select')) return;
  if (event.cancelable) event.preventDefault();
}, { passive: false });
document.addEventListener('gesturestart', (event) => event.preventDefault());

createRoot(root).render(<App />);
