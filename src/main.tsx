import { render } from 'preact';
import { App } from './app/App';
import './styles/global.css';
import './styles/app.css';

const root = document.getElementById('app');
if (root) render(<App />, root);
