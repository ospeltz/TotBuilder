import React from "react";
import PropTypes from "prop-types";
import { useDrop } from "react-dnd";

import TotEvent from "./TotEvent";

import { Times, percMap } from "/src/Constants";
import { DragItemTypes } from "../Constants";

function TotSlot(props) {
	const { time, duration, type, events, deleteEvent, slotId } = props;
	var acceptsDrop =
		type === "EVENTS" ? DragItemTypes.EVENT : DragItemTypes.NULL;
	const [, drop] = useDrop({
		accept: DragItemTypes.EVENT,
		drop: (item, mon) => {
			return {
				dropDay: props.day,
				slotId,
				target: "SLOT"
			};
		},
		hover: (item, mon) => {
			console.log("totSlot", mon.isOver({ shallow: true }));
		}
	});

	return (
		<div
			style={slotStyle(time, duration, type)}
			onClick={e => props.addToSlot(e, type, slotId)}
			ref={drop}
		>
			{events.map((ev, i) => {
				return (
					<TotEvent
						key={i}
						deets={ev}
						time={time}
						day={props.day}
						deleteEvent={deleteEvent}
						duration={props.duration}
						concurrent={events.length}
						rearrangeEvents={props.rearrangeEvents}
						insertIntoSlot={props.insertIntoSlot}
					/>
				);
			})}
		</div>
	);
}

const slotStyle = (time, duration, type) => {
	const { OPEN, CLOSE } = Times;
	var c = "";
	if (type === "MOVE") {
		c = "blue";
	} else if (type === "EVENTS") {
		c = "red";
	} else if (type === "MEAL") {
		c = "purple";
	} else {
		c = "green"; // END
	}
	return {
		border: "solid",
		borderColor: c,
		position: "absolute",
		width: "97%",
		top: percMap(time) + "%",
		height: (100 * duration) / (CLOSE - OPEN + 0.5) - 1 + "%"
	};
};

TotSlot.propTypes = {
	type: PropTypes.string.isRequired,
	events: PropTypes.array.isRequired,
	time: PropTypes.number.isRequired,
	duration: PropTypes.number.isRequired,
	deleteEvent: PropTypes.func.isRequired,
	rearrangeEvents: PropTypes.func.isRequired
};

export default TotSlot;
