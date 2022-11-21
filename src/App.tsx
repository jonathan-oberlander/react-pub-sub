import { useMessagingState } from "./messaging";
import { createAtom } from "./simplePubSub";

function Inner({ children }: ReactChildren) {
  return <div style={{
    border: '1px solid gray',
    padding: 2,
    margin: 2,
  }}>
    {children}
  </div>;
}

// STATE //////////////////////////////////////////

const useCounter = createAtom(0);

function Increase({ by }: { by: number }) {
  const { state, setState } = useCounter();
  const onClick = () => setState(state + by);

  return <button onClick={onClick}>Add {by}</button>;
}

function DisplayCounter() {
  const { state } = useCounter();
  return <h1>{state}</h1>;
}

// REDUCER //////////////////////////////////////////

function ShowMessagingState() {
  const { state } = useMessagingState();
  return <h1>{state.amount} {state.message}</h1>;
}

function MessageActions() {
  const { state, add, sub, reset, win } = useMessagingState()

  return (
    <div>
      <button disabled={state.amount > 20000} onClick={() => sub(2030)}>Sub</button>
      <button disabled={state.amount > 20000} onClick={reset}>Reset</button>
      <button disabled={state.amount > 20000} onClick={() => add(1240)}>Add</button>
      <button onClick={win}>Win</button>
    </div>
  );
}

// APP /////////////////////////////////////////////

function Composition() {
  return (
    <div>
      <Inner>
        <Inner>
          <Inner>
            <hr />
            <ShowMessagingState />
          </Inner>
          <Inner>
            <DisplayCounter />
          </Inner>
        </Inner>
      </Inner>
      <MessageActions />
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      <DisplayCounter />
      <Increase by={1} />
      <Increase by={5} />
      <Composition />
    </div>
  );
}
