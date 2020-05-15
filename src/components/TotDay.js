import React from "react";
import PropTypes from "prop-types";
import { useDrop } from "react-dnd";

import TotSlot from "./TotSlot.js";
import { percMap, generateTimeOptions } from "/src/Constants";
import { DragItemTypes } from "../Constants.js";

// each day follows this style. Name at top, with a clickable div
// that is a fixed length corresponding to the length of the day,
// where you click on the div is the time and place the event is
// added
function TotDay(props) {
	// set up useDrop to allow events to be dropped
	const [, drop] = useDrop({
		accept: DragItemTypes.EVENT,
		drop: (item, mon) => {
			console.log(mon.isOver({ shallow: true }));
			if (mon.isOver({ shallow: true })) {
				return {
					dropDay: props.day,
					dy: mon.getDifferenceFromInitialOffset().y,
					target: "EMPTY"
				};
			} else {
				return mon.getDropResult();
			}
		},
		hover: (item, mon) => {
			console.log("TotDay", mon.isOver({ shallow: true }));
		}
	});
	const prettyTime = t => {
		var hours = Math.floor(t);
		var mins = t - hours === 0.5 ? "30" : "00";
		return hours + ":" + mins;
	};
	// returns TotDay component, events rendered in order that they
	// are in app level state
	return (
		<div style={totDayStyle(props.hidden)}>
			<h1> {props.id} </h1>
			<div style={timeBarStyle}>
				{generateTimeOptions().map(t => {
					return (
						<div
							key={t}
							style={{
								position: "absolute",
								top: percMap(t) + "%"
							}}
						>
							{prettyTime(t)}
						</div>
					);
				})}
			</div>
			<div
				style={clickBoxStyle}
				// call to add event, passing e, the click event, and the day index
				onClick={e => props.addEvent(props.day, e)}
				ref={drop}
			>
				{props.slots.map(slot => (
					<TotSlot // TODO handle concurrent events
						key={slot.slotId}
						slotId={slot.slotId}
						time={slot.time}
						type={slot.type}
						description={slot.description}
						duration={slot.duration}
						events={slot.events} // list of {id, name}, empty if MOVE or MEAL
						day={props.day}
						deleteEvent={props.deleteEvent}
						addToSlot={props.addToSlot}
						dragEvent={props.dragEvent}
						dragEventBorder={props.dragEventBorder}
						rearrangeEvents={props.rearrangeEvents}
						dropEventOnSlot={props.dropEventOnSlot}
						insertIntoSlot={props.insertIntoSlot}
					/>
				))}
			</div>
		</div>
	);
}

// returns style which must change when the new event window is open
const totDayStyle = hidden => {
	return {
		float: "left",
		width: "30%",
		padding: "5px",
		backgroundColor: "#bababa",
		border: "dotted",
		opacity: hidden ? "25%" : "100%"
	};
};

const clickBoxStyle = {
	position: "relative",
	width: "85%",
	height: "1000px",
	border: "solid",
	cursor: "pointer",
	backgroundColor: "white",
	float: "right",
	zIndex: 0
};

const timeBarStyle = {
	position: "relative",
	width: "5%",
	height: "1000px",
	float: "left",
	fontSize: "12pt"
};

// PropTypes
TotDay.propTypes = {
	addEvent: PropTypes.func.isRequired,
	day: PropTypes.number.isRequired,
	slots: PropTypes.array.isRequired,
	deleteEvent: PropTypes.func.isRequired,
	dropEvent: PropTypes.func.isRequired,
	rearrangeEvents: PropTypes.func.isRequired
};

export default TotDay;
