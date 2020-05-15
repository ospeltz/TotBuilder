import React from "react";

class TotInput extends React.Component {
	state = {
		obj: ""
	};

	onChange = e => this.setState({ [e.target.name]: e.target.value });

	onSubmit = e => {
		e.preventDefault();
		this.props.import(this.state.obj);
	};
	render() {
		if (this.props.showForm) {
			return (
				<form onSubmit={this.onSubmit}>
					<textarea onChange={this.onChange} name="obj" />
					<button type="submit">submit </button>
					<button onClick={this.props.toggleImportForm}>cancel</button>
				</form>
			);
		} else {
			return <button onClick={this.props.toggleImportForm}>import</button>;
		}
	}
}
export default TotInput;
