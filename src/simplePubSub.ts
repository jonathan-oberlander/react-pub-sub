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
  reducer: Reducer<S, M>,
  initialState: S,
) => {
  const suscribers = atom<S>();

  return () => {
    const [value, setValue] = useState(initialState);

    useEffect(() => suscribers.suscribe(setValue), []);

    return {
      state: value,
      sendMessage: (message: M) => {
        const state = reducer(value, message);
        setValue(state);
        suscribers.publish(state);
      },
    };
  };
};

export type Reducer<S, M> = (state: S, message: M) => S;
