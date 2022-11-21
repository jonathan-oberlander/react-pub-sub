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
  const { add, sub, reset } = useMessagingState()

  return (
    <div>
      <button onClick={() => sub(2030)}>Sub</button>
      <button onClick={reset}>Reset</button>
      <button onClick={() => add(1240)}>Add</button>
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
