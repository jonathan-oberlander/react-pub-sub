import { useState, useEffect, useMemo } from 'react'

function atom<T>() {
  type Fn = (value: T) => void
  const set: Set<Fn> = new Set()

  return {
    subscribe(fn: Fn): () => void {
      set.add(fn)
      return () => {
        set.delete(fn)
      }
    },

    publish(value: T): void {
      set.forEach(fn => fn(value))
    },
  }
}

export const createAtom = <V,>(initValue: V) => {
  const suscribers = atom<V>()

  return () => {
    const [value, setValue] = useState(initValue)

    useEffect(() => suscribers.subscribe(setValue), [])

    return {
      state: value,
      setState: (v: V) => {
        setValue(v)
        suscribers.publish(v)
      },
    }
  }
}

export const createAtomReducer = <S, M>(reducer: Reducer<S, M>, initialState: S) => {
  const suscribers = atom<S>()

  return () => {
    const [value, setValue] = useState(initialState)

    useEffect(() => suscribers.subscribe(setValue), [])

    return {
      state: value,
      sendMessage: (message: M) => {
        const state = reducer(value, message)
        setValue(state)
        suscribers.publish(state)
      },
    }
  }
}

export type Reducer<S, M> = (state: S, message: M) => S
type SelectorMap<V> = Record<string, (v: V, ...args: any[]) => V>
type UpdaterMap<V> = Record<string, (v: V, ...args: any[]) => V>

type SelectFunctions<V, S extends SelectorMap<V>> = {
  [K in keyof S]: S[K] extends (v: V, ...args: infer P) => infer R
    ? (...args: P) => R
    : never
}

type UpdaterFns<V, U extends UpdaterMap<V>> = {
  [K in keyof U]: (
    ...args: Parameters<U[K]> extends [any, ...infer P] ? P : never
  ) => void
}

type AtomRT<V, S extends SelectorMap<V> = {}, U extends UpdaterMap<V> = {}> = () => {
  state: V
  setState: (updater: V | ((current: V) => V)) => void
} & SelectFunctions<V, S> &
  UpdaterFns<V, U>

export function createAtomConfig<
  V,
  S extends SelectorMap<V> = {},
  U extends UpdaterMap<V> = {}
>(initValue: V, selectors?: S, updaters?: U): AtomRT<V, S, U> {
  const subscribers = atom<V>()

  return () => {
    const [value, setValue] = useState(initValue)
    useEffect(() => subscribers.subscribe(setValue), [])

    const selectorsObj = useMemo(() => {
      if (!selectors) return {} as SelectFunctions<V, S>

      return Object.fromEntries(
        Object.entries(selectors).map(([key, selectorFn]) => [
          key,
          () => selectorFn(value),
        ])
      ) as SelectFunctions<V, S>
    }, [value, selectors])

    const updatersObj = useMemo(() => {
      if (!updaters) return {} as UpdaterFns<V, U>
      return Object.fromEntries(
        Object.entries(updaters).map(([key, updaterFn]) => [
          key,
          (...args: any[]) => {
            const next = updaterFn(value, ...args)
            setValue(next)
            subscribers.publish(next)
          },
        ])
      ) as UpdaterFns<V, U>
    }, [value, updaters])

    return {
      state: value,
      setState: (updater: V | ((current: V) => V)) => {
        const next = updater instanceof Function ? updater(value) : updater
        setValue(next)
        subscribers.publish(next)
      },
      ...selectorsObj,
      ...updatersObj,
    }
  }
}

const counterAtom = createAtomConfig(0, {
  by: (x: number, n: number) => n * x,
  by2: (n: number) => n * 2
}, {
  increment: (current: number) => current + 1,
  add: (current: number, amount: number) => current + amount,
  multiply: (current: number, factor: number) => current * factor,
})

function Counter() {
  const counter = counterAtom()
  counter.increment() // ✅ Now updates state
  counter.add(5) // ✅ Expects number
  counter.multiply(3) // ✅ Expects number
  // counter.add('hello') // ❌ TypeScript error!

  counter.by2()
  counter.by(7)
}
