import { useState, useEffect } from "react";

function atom<T>() {
  type Fn = (value: T) => void;
  const set: Set<Fn> = new Set();

  return {
    suscribe(fn: Fn): () => void {
      set.add(fn);
      return () => {
        set.delete(fn);
      };
    },

    publish(value: T): void {
      set.forEach((fn) => fn(value));
    },
  };
}

export const createAtom = <V>(initValue: V) => {
  const suscribers = atom<V>();

  return () => {
    const [value, setValue] = useState(initValue);

    useEffect(() => suscribers.suscribe(setValue), []);

    return {
      state: value,
      setState: (v: V) => {
        setValue(v);
        suscribers.publish(v);
      },
    };
  };
};

export const createAtomReducer = <S, M>(
  initialState: S,
  reducer: Reducer<M, S>
) => {
  const suscribers = atom<S>();

  return () => {
    const [value, setValue] = useState(initialState);

    useEffect(() => suscribers.suscribe(setValue), []);

    return {
      state: value,
      sendMessage: (m: M, s: S) => {
        const state = reducer(m, s);
        setValue(state);
        suscribers.publish(state);
      },
    };
  };
};

export type Reducer<M, S> = (message: M, state: S) => S;
