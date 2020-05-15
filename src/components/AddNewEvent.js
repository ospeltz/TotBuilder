import React from "react";
import PropTypes from "prop-types";
import { generateTimeOptions } from "/src/Constants";
import event_data from "/src/event_data.json";

// new event window, accepts user input and calls saveEvent from Tot
// to add new events to state
class AddNewEvent extends React.Component {
	// component level state, only relevant when creating new events
	state = {
		type: "EVENTS", // defaults
		description: "",
		time: this.props.startTime,
		duration: 1,
		day: this.props.day,
		slotId: Math.random(),
		eventId:
			this.props.remainingEvents.filter(ev => ev.used !== true).length > 0
				? this.props.remainingEvents.filter(ev => ev.used !== true)[0].id
				: -Math.random(),
		addToSlot: this.props.addToSlot
	};

	// updates the state as the form is filled
	// [e.target.name] : e.target.value, the brakcets allow us to use a string
	// e.target.name, as a key for set state, this is called dynamic keys
	onChange = e => this.setState({ [e.target.name]: e.target.value });

	// changes the form to allow typing for MOVE, MEAL, or END
	onChangeType = e => {
		this.onChange(e);
	};
	// submits details from inputs to save state
	onSubmit = e => {
		e.preventDefault(); // not sure what this does but it needs to be there
		var eList = [];
		if (this.state.eventId < 0 && this.state.type === "EVENTS") {
			alert("select an event");
			return;
		}
		if (this.state.type === "EVENTS") {
			var name = this.props.remainingEvents.filter(
				ev => ev.id == this.state.eventId
			)[0].name;
			eList.push({ id: this.state.eventId, name });
		} else {
			eList.push({ id: -Math.random(), name: this.state.description });
		}
		this.props.saveEvent(
			// call to saveEvent in Tot
			{
				// TotSlot form
				type: this.state.type,
				time: this.state.time,
				description: this.state.description,
				duration: this.state.duration,
				slotId: this.state.slotId,
				events: eList
			},
			this.state.day,
			this.state.addToSlot
		);
		this.setState({
			// reset default component state
			type: "EVENTS",
			description: "",
			time: this.props.startTime,
			duration: 1,
			eventId: -1,
			slotId: Math.random()
		});
	};

	render() {
		console.log(this.state);
		return (
			<div style={popupStyle}>
				<form
					onSubmit={this.onSubmit}
					// TODO format this form nicely
				>
					Type
					<select
						onChange={this.onChangeType}
						name="type"
						defaultValue="EVENTS"
					>
						<option value="MOVE">MOVE</option>
						<option value="EVENTS">EVENT</option>
						<option value="MEAL">MEAL</option>
						<option value="END">END</option>
					</select>
					{this.state.type === "EVENTS" ? (
						<div>
							Event
							<select name="eventId" autoFocus onChange={this.onChange}>
								{this.props.remainingEvents
									.filter(event => !event.used)
									.map((event, i) => {
										return (
											<option
												defaultValue={i === 0}
												key={event.id}
												value={event.id}
											>
												{event.name}
											</option>
										);
									})}
							</select>
						</div>
					) : (
						<div>
							description
							<input
								type="text"
								name="description"
								onChange={this.onChange}
							/>
						</div>
					)}
					{this.state.addToSlot ? null : (
						<div>
							<select
								name="time"
								defaultValue={this.props.startTime}
								label="time"
								onChange={this.onChange}
							>
								{generateTimeOptions().map(t => {
									return (
										<option key={t} value={t}>
											{t}
										</option>
									);
								})}
							</select>
							<select
								type="number"
								name="duration"
								onChange={this.onChange}
								defaultValue={1}
								label="duration"
							>
								{[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map(t => {
									return (
										<option value={t} key={t}>
											{t}
										</option>
									);
								})}
							</select>
						</div>
					)}
					<button id="save" value="add event" type="submit">
						add event
					</button>
					<button value="cancel" onClick={this.props.cancel}>
						cancel
					</button>
				</form>
			</div>
		);
	}
}

const popupStyle = {
	border: "solid",
	position: "absolute",
	top: "50%",
	left: "25%",
	width: "50%",
	backgroundColor: "white"
};

// propTypes, prop validation
AddNewEvent.propTypes = {
	startTime: PropTypes.number.isRequired,
	saveEvent: PropTypes.func.isRequired,
	cancel: PropTypes.func.isRequired,
	day: PropTypes.number.isRequired
};

export default AddNewEvent;
