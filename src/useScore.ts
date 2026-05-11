import { createShared } from "./createShared";

const initialState = 0;

export const score = createShared(initialState, {
	actions: {
		set: (state: number) => state,
		incrementBy: (state: number, by: number) => state + by,
		reset: () => initialState,
	},
	selectors: {
		doubled: (state: number) => state * 2,
	},
});

const set = score().actions.incrementBy(20);
const read = score().selectors.doubled;
