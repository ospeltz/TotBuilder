import React from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";

import TotDay from "./components/TotDay";
import AddNewEvent from "./components/AddNewEvent";
import TotOutput from "./components/TotOutput";
import TotInput from "./components/TotInput";
import { Times } from "./Constants";
import event_data_2020 from "./event_data_2020.json";

// import uuid from "uuid";

const { OPEN, CLOSE } = Times;
export class Tot extends React.Component {
	state = {
		dayNames: ["Friday", "Saturday", "Sunday"],
		days: [[], [], []],
		showNewEventWindow: false,
		addingToExistingSlot: false,
		newEventTime: -100,
		newEventDay: "",
		newEventSlotId: -1,
		generated: false,
		output: "",
		showImportForm: false,
		remainingEvents: event_data_2020
	};

	addEvent = (day, e) => {
		e.stopPropagation();
		// e.persist();
		// get click position as perctage of parent
		var divPos = (e.pageY - e.target.offsetTop) / e.target.offsetHeight;
		// translate to a start time in [OPEN, CLOSE]
		var startTime = divPos * (CLOSE + 0.5 - OPEN) + OPEN;
		// round startTime to half hour incremements
		startTime = Math.round(startTime / 0.5) / 2;
		// translate to percentage of parent (now rounded)
		// add 0.5 to totat hours to take care of edge
		this.setState(state => {
			return {
				showNewEventWindow: !this.state.showNewEventWindow,
				newEventTime: startTime,
				newEventDay: day
			};
		});
		this.toggleNewEventPopup(false);
	};

	toggleNewEventPopup = addToSlot => {
		this.setState({
			showNewEventWindow: !this.state.showNewEventWindow,
			addingToExistingSlot: addToSlot
		});
	};

	saveEvent = (newEvent, day, addToSlot, toggle = true) => {
		// TODO get real IDs, validate times
		console.log("newEvent", newEvent);
		console.log("slotId", this.state.newEventSlotId);
		this.setState({
			days: this.state.days.map((slotList, i) => {
				if (i === day) {
					if (addToSlot) {
						slotList.map(slot => {
							if (slot.slotId === this.state.newEventSlotId) {
								slot.events = [...slot.events, ...newEvent.events];
							}
							return slotList;
						});
					} else {
						slotList.push(newEvent);
						slotList.sort((a, b) => {
							return a.time - b.time;
						});
					}
				}
				return slotList;
			}),
			remainingEvents: this.state.remainingEvents.map(ev => {
				if (ev.id == newEvent.events[0].id) {
					ev.used = true;
				}
				return ev;
			})
		});
		if (toggle) {
			this.toggleNewEventPopup(false);
		}
	};

	addToSlot = (e, type, slotId) => {
		e.stopPropagation();
		if (type === "EVENTS") {
			console.log("type:", type, "slotId", slotId);
			this.setState({ newEventSlotId: slotId });
			this.toggleNewEventPopup(true);
		}
	};

	deleteEvent = (deleteId, e) => {
		if (e) {
			e.stopPropagation();
		}
		this.setState({
			days: this.state.days.map(slotList => {
				return slotList
					.map(slot => {
						var updated = slot.events.filter(ev => ev.id !== deleteId);
						slot.events = updated;
						return slot;
					})
					.filter(slot => slot.events.length > 0);
			}),
			remainingEvents: this.state.remainingEvents.map(ev => {
				if (ev.id == deleteId) {
					ev.used = false;
				}
				return ev;
			})
		});
	};

	insertIntoSlot = (item, mon) => {
		// TODO fix events disappearing when dropped on themselves
		console.log("insertIntoSlot", mon);
		var dropRes = mon.getDropResult();
		// var dropSlot = this.state.days[dropRes.dropDay].filter(
		// 	sl => sl.slotId === dropRes.slotId
		// )[0];
		// if (dropSlot.events.indexOf)
		console.log("dropRes", dropRes);
		this.setState({ newEventSlotId: dropRes.slotId });
		this.deleteEvent(item.id);
		var movedEvent = { events: [{ id: item.id, name: item.name }] };
		this.saveEvent(movedEvent, dropRes.dropDay, true, false);
		this.setState({ newEventSlotId: -1 });
	};

	rearrangeEvents = (item, mon) => {
		var temp = this.state.days[item.initDay].filter(
			slot => slot.events.filter(ev => ev.id === item.id).length === 1
		)[0];
		temp = { ...temp }; // shallow copy
		temp.slotId = Math.random();
		if (temp.events.length > 1) {
			temp.events = [{ id: item.id, name: item.name }];
		}
		var dropRes = mon.getDropResult();
		var perc = dropRes.dy / 1000; // TODO make the window size a global constant
		var newTime = temp.time + perc * (CLOSE - OPEN);
		newTime = Math.round(newTime * 2) / 2;
		temp.time = newTime;
		this.deleteEvent(item.id);
		this.saveEvent(temp, dropRes.dropDay, false, false);
	};

	dragEventBorder = (id, e) => {
		e.stopPropagation();
	};

	generateTotOutput = () => {
		this.setState({ generated: true });
		var obj = {
			header: {
				version: 6,
				date: "07/29/20",
				title: "Rootin Tootin"
			},
			data: {
				day1: this.translateSlots(0),
				day2: this.translateSlots(1),
				day3: this.translateSlots(2)
			}
		};
		this.setState({ output: obj });
	};

	// TODO handle "event" placeholders for MOVE MEAL etc
	translateSlots = day => {
		return this.state.days[day].map(slot => {
			var hour = Math.floor(slot.time);
			var mins = slot.time - hour === 0.5 ? "30" : "00";
			var ampm = "AM";

			if (hour > 12) {
				hour = hour - 12;
				ampm = "PM";
			} else if (hour === 12) {
				ampm = "PM";
			}
			return {
				time: hour + ":" + mins + ampm,
				duration: slot.duration,
				type: slot.type,
				events: slot.events
					.map(ev => {
						return ev.id;
					})
					.filter(id => id >= 0),
				description: slot.description,
				status: "PENDING"
			};
		});
	};

	toggleImportForm = () => {
		this.setState({ showImportForm: !this.state.showImportForm });
	};

	import = obj => {
		this.toggleImportForm();
		console.log("import", obj);
		var data = JSON.parse(obj);
		this.setState({
			days: [
				this.reverseTranslateSlot(data.data.day1),
				this.reverseTranslateSlot(data.data.day2),
				this.reverseTranslateSlot(data.data.day3)
			]
		});
	};

	reverseTranslateSlot = day => {
		// day is an array in the tot output slot format
		return day.map(slot => {
			var t = slot.time.split(":");
			console.log(t[1].slice(-2));
			if (t[1].slice(-2) === "PM" && t[0] !== "12") {
				console.log("sup");
				t[0] = parseInt(t[0], 10) + 12;
			}
			var eList = [];
			if (slot.type === "EVENTS") {
				eList = slot.events.map(event => {
					var name = event_data_2020.filter(
						ev => parseInt(ev.id, 10) === parseInt(event, 10)
					)[0].name;
					this.setState({
						remainingEvents: this.state.remainingEvents.map(ev => {
							if (ev.id == event) {
								ev.used = true;
							}
							return ev;
						})
					});
					return { id: parseInt(event, 10), name };
				});
			} else {
				eList = [{ id: -Math.random(), name: slot.description }];
			}
			return {
				type: slot.type,
				time: parseInt(t[0], 10) + (t[1].slice(0, 2) === "30" ? 0.5 : 0),
				description: slot.description,
				duration: parseFloat(slot.duration),
				slotId: Math.random(),
				events: eList
			};
		});
	};

	generateTotDays = () => {
		var days = [];
		for (var i = 0; i < 3; i++) {
			days.push(
				<TotDay
					id={this.state.dayNames[i]}
					key={this.state.dayNames[i]}
					day={i}
					OPEN={OPEN}
					CLOSE={CLOSE}
					addEvent={this.addEvent}
					addToSlot={this.addToSlot}
					slots={this.state.days[i]}
					hidden={this.state.showNewEventWindow}
					deleteEvent={this.deleteEvent}
					dragEventBorder={this.dragEventBorder}
					dragEvent={this.dragEvent}
					dropEvent={this.dropEvent}
					rearrangeEvents={this.rearrangeEvents}
					dropEventOnSlot={this.dropEventOnSlot}
					insertIntoSlot={this.insertIntoSlot}
				/>
			);
		}

		return days;
	};

	render() {
		// TODO load event names and IDs from tot DB
		return (
			<div style={{ display: "flex", flexDirection: "column" }}>
				<DndProvider className="Tot" backend={Backend}>
					<div>
						{this.generateTotDays()}
						{this.state.showNewEventWindow ? (
							<AddNewEvent
								startTime={this.state.newEventTime}
								saveEvent={this.saveEvent}
								cancel={this.toggleNewEventPopup}
								day={this.state.newEventDay}
								addToSlot={this.state.addingToExistingSlot}
								remainingEvents={this.state.remainingEvents}
							/>
						) : null}
					</div>
				</DndProvider>

				<TotOutput
					generated={this.state.generated}
					generateTotOutput={this.generateTotOutput}
					output={this.state.output}
					clear={e => {
						this.setState({ generated: false });
					}}
				/>
				<TotInput
					showForm={this.state.showImportForm}
					import={this.import}
					toggleImportForm={this.toggleImportForm}
				/>
			</div>
		);
	}
}

export default Tot;
