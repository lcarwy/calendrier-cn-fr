import { render } from 'preact';
import { App } from './app/App';
import { initTheme } from './app/theme';
import './styles/global.css';
import './styles/app.css';

initTheme();

const root = document.getElementById('app');
if (root) render(<App />, root);
