import { render } from 'preact';

import { Map } from './components/Map.jsx';
import './style.css';

export function App() {
	return (
		<>
			<span className="title">Catalyst California Maps</span>
			<Map></Map>
		</>
	);
}

render(<App />, document.getElementById('app'));
