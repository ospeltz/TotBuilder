import React from "react";

function TotOutput(props) {
	if (props.generated) {
		return (
			<div>
				{JSON.stringify(props.output)}
				<br />
				<button onClick={props.clear}>clear</button>
			</div>
		);
	} else {
		return <button onClick={props.generateTotOutput}>generate</button>;
	}
}

export default TotOutput;
