import { createAtom, createAtomReducer, Reducer } from "./simplePubSub";

const useCounter = createAtom(0);

type IncreaseProps = { by: number };

function Increase({ by }: IncreaseProps) {
  const { state, setState } = useCounter();
  const onClick = () => setState(state + by);

  return <button onClick={onClick}>Add {by}</button>;
}

function DisplayCounter() {
  const { state } = useCounter();

  return <h1>{state}</h1>;
}

function Composed() {
  return (
    <div>
      <Inner />
      <Inner />
      <Inner />
      <DisplayCounter />
    </div>
  );
}

function Inner() {
  return <div>Inner component</div>;
}

export default function () {
  return (
    <div className="App">
      <DisplayCounter />
      <Increase by={1} />
      <Increase by={5} />
      <hr />
      <ShowState />
      <Dialer />
    </div>
  );
}

type State = {
  amount: number;
};

type Message =
  | { msg: "increase"; amount: number }
  | { msg: "decrease"; by: number }
  | { msg: "reset" };

const reducer: Reducer<Message, State> = (message, state) => {
  switch (message.msg) {
    case "increase":
      return {
        ...state,
        amount: state.amount + message.amount,
      };
    case "decrease":
      return {
        ...state,
        amount: state.amount - message.by,
      };
    case "reset":
      return {
        ...state,
        amount: 0,
      };
  }
};

const useData = createAtomReducer({ amount: 0 }, reducer);

function ShowState() {
  const { state } = useData();

  return <h1>{state.amount}</h1>;
}

function Dialer() {
  const { state, sendMessage } = useData();

  const add = () => sendMessage({ msg: "increase", amount: 20 }, state);
  const sub = () => sendMessage({ msg: "decrease", by: 20 }, state);
  const reset = () => sendMessage({ msg: "reset" }, state);

  return (
    <div>
      <button onClick={sub}>Sub</button>
      <button onClick={reset}>Reset</button>
      <button onClick={add}>Add</button>
    </div>
  );
}
