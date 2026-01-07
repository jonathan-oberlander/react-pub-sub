import { useState, useEffect, useMemo, useReducer } from 'react'

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
  const subscribers = atom<V>()

  return () => {
    const [value, setValue] = useState(initValue)

    useEffect(() => {
      const unsubscribe = subscribers.subscribe(setValue)
      return () => unsubscribe()
    }, [])

    return {
      state: value,
      setState: (v: V) => {
        setValue(v)
        subscribers.publish(v)
        //   const next = typeof v === 'function' ? (v as (prev: V) => V)(value) : v
        //   setValue(next)
        //   subscribers.publish(next)
      },
    }
  }
}

export const createReducedAtom = <V extends object>(initValue: V) => {
  const subscribers = atom<V>()

  return () => {
    const [state, dispatch] = useReducer(
      (prev: V, next: Partial<V>) => ({ ...prev, ...next }),
      initValue
    )

    useEffect(() => {
      const unsubscribe = subscribers.subscribe(v => dispatch(v as Partial<V>))
      return () => unsubscribe()
    }, [])

    return {
      state,
      setState: (update: Partial<V>) => {
        const nextState = { ...state, ...update }
        dispatch(update)
        subscribers.publish(nextState)
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

type SelectorMap<V> = Record<string, (v: V, ...args: any[]) => any>
type UpdaterMap<V> = Record<string, (v: V, ...args: any[]) => V>

type SelectFunctions<V, S extends SelectorMap<V>> = {
  [K in keyof S]: (
    ...args: Parameters<S[K]> extends [any, ...infer P] ? P : never
  ) => ReturnType<S[K]>
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
>(initValue: V, updaters?: U, selectors?: S): AtomRT<V, S, U> {
  const subscribers = atom<V>()

  return () => {
    const [value, setValue] = useState(initValue)
    useEffect(() => {
      // subscribers.subscribe(setValue)
      const unsubscribe = subscribers.subscribe(setValue)
      return () => unsubscribe()
    }, [])

    const selectorsObj = useMemo(() => {
      if (!selectors) {
        return {} as SelectFunctions<V, S>
      }

      return Object.fromEntries(
        Object.entries(selectors).map(([key, selectorFn]) => [
          key,
          (...args: any[]) => selectorFn(value, ...args),
        ])
      ) as SelectFunctions<V, S>
    }, [value, selectors])

    const updatersObj = useMemo(() => {
      if (!updaters) {
        return {} as UpdaterFns<V, U>
      }

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
