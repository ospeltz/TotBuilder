export const DragItemTypes = {
	EVENT: "totEvent",
	NULL: "noDroppyDroppy"
};

// NOTE time is only tracked in half hour increments, half hours denoted
// by decimal .5 so 1:30pm -> 13.5
export const Times = {
	OPEN: 9,
	CLOSE: 22
};

export const generateTimeOptions = () => {
	var res = [];
	for (var t = Times.OPEN; t <= Times.CLOSE; t += 0.5) {
		res.push(t);
	}
	return res;
};

export const percMap = t => {
	return (100 * (t - Times.OPEN)) / (Times.CLOSE + 0.5 - Times.OPEN);
};
