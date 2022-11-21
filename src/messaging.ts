import { useEffect } from "react";
import { createAtomReducer, Reducer } from "./simplePubSub";

const initialState = {
  amount: 0,
  message: '',
}

type State = typeof initialState

type Message =
  | { msg: "increase"; amount: number }
  | { msg: "decrease"; by: number }
  | { msg: "reset" }
  | { msg: "win" }

const reducer: Reducer<State, Message> = (state, message,) => {
  switch (message.msg) {
    case "increase":
      return {
        ...state,
        amount: state.amount + message.amount,
        message: state.amount > 9000 ? 'It\'s over 9000!!!' : 'going up >.<'
      };
    case "decrease":
      return {
        ...state,
        amount: state.amount - message.by,
        message: state.amount > 0 ? 'going down :(' : 'oh no'
      };
    case "win":
      return {
        ...state,
        amount: Infinity,
        message: 'and beyond'
      };
    case "reset":
      return {
        ...state,
        amount: 0,
        message: 'Son of a B$@#!!'
      };
  }
};

export const useMessagingAtom = createAtomReducer(reducer, initialState)

export const useMessagingState = () => {
  const { state, sendMessage } = useMessagingAtom()

  const add = (amount: number) => sendMessage({ msg: "increase", amount })
  const sub = (by: number) => sendMessage({ msg: "decrease", by })
  const reset = () => sendMessage({ msg: "reset" })
  const win = () => sendMessage({ msg: "win" })

  return {
    state,
    add,
    sub,
    reset,
    win,
  }
};
