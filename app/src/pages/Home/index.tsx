import { Map } from '../../components/Map';
import './style.css';

export function Home() {
	return (
		<div class="home">
			<h1>Catalyst California Maps</h1>
			<section>
				<Map></Map>
			</section>
		</div>
	);
}
