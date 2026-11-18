import { createRoot } from 'react-dom/client';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import { App } from '@/app/App';
import '@/styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Нет корневого элемента');

createRoot(root).render(<App />);
