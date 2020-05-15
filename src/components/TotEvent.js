import React from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";

import { DragItemTypes } from "/src/Constants";

// each event represented here, positioned absolutely according to time
function TotEvent(props) {
	const { id, name } = props.deets; // destructure the props for shorter references

	// set up React Dnd
	const [{ isDragging }, drag] = useDrag({
		item: {
			type: DragItemTypes.EVENT,
			id,
			name,
			initDay: props.day,
			initTime: props.time
		},
		collect: monitor => ({
			isDragging: !!monitor.isDragging()
		}),
		end: (item, monitor) => {
			if (monitor.didDrop()) {
				if (monitor.getDropResult().target === "EMPTY") {
					props.rearrangeEvents(item, monitor);
				} else {
					props.insertIntoSlot(item, monitor);
				}
			}
		}
	});
	const prettyTime = t => {
		var hours = Math.floor(t);
		var mins = t - hours === 0.5 ? "30" : "00";
		return hours + ":" + mins;
	};
	return (
		<div
			style={eventStyle(isDragging, props.concurrent)}
			draggable={true}
			onClick={e => e.stopPropagation()}
		>
			<div
				style={innerBoxStyle}
				ref={drag}
				onClick={e => e.stopPropagation()}
			>
				{name}{" "}
				{prettyTime(props.time) +
					"-" +
					prettyTime(parseFloat(props.time) + parseFloat(props.duration))}
				{/* TODO format this nicely */}
				<button
					style={{ float: "right", cursor: "pointer" }}
					onClick={e => props.deleteEvent(id, e)}
					label="delete"
				>
					delete
				</button>
			</div>
		</div>
	);
}

// get event style (shape) based on duration, start time, and slots in day
const eventStyle = (isDragging, concurrent) => {
	return {
		cursor: "n-resize",
		border: isDragging ? "solid" : "",
		borderColor: isDragging ? "yellow" : "black",
		padding: "5px",
		width: 90 / concurrent + "%",
		float: "left",
		opacity: isDragging ? "50%" : "100%",
		// subtract 2 perc to deal with overlap, why? idk
		height: "75%",
		zIndex: 1
	};
};

// inner box style
const innerBoxStyle = {
	cursor: "move",
	zIndex: 2,
	height: "100%",
	width: "fillParent"
};

TotEvent.propTypes = {
	deets: PropTypes.object.isRequired,
	deleteEvent: PropTypes.func.isRequired,
	time: PropTypes.number.isRequired,
	concurrent: PropTypes.number.isRequired, // # of concurrent events
	rearrangeEvents: PropTypes.func.isRequired,
	day: PropTypes.number.isRequired
};

export default TotEvent;
