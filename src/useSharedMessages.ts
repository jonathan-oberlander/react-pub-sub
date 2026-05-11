import { createSharedReducer, type Reducer } from "./createShared";

const initialState = {
	amount: 0,
	message: "",
};

type State = typeof initialState;

type Message =
	| { message: "increase"; amount: number }
	| { message: "decrease"; by: number }
	| { message: "reset" }
	| { message: "win" };

const reducer: Reducer<State, Message> = (state, message) => {
	switch (message.message) {
		case "increase":
			return {
				amount: state.amount + message.amount,
				message:
					state.amount + message.amount > 9000 ? "it's over 9000!!!" : "up",
			};
		case "decrease":
			return {
				amount: state.amount - message.by,
				message: state.amount > 0 ? "down" : "noooooooo",
			};
		case "win":
			return {
				amount: Infinity,
				message: "W ...and beyond",
			};
		case "reset":
			return {
				amount: 0,
				message: "Try again",
			};
	}
};

export const useSharedMessages = createSharedReducer(reducer, initialState);
