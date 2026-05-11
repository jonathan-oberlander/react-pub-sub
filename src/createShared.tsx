import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'

function createPubSub<T>() {
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
      set.forEach(fn => {
        fn(value)
      })
    },
  }
}

export const createSharedState = <V,>(initValue: V) => {
  const pubSub = createPubSub<V>()

  return () => {
    const [value, setValue] = useState(initValue)

    useEffect(() => {
      const unsubscribe = pubSub.subscribe(setValue)
      return () => unsubscribe()
    }, [])

    return {
      state: value,
      setState: (v: V | ((prev: V) => V)) => {
        const next = typeof v === 'function' ? (v as (prev: V) => V)(value) : v
        setValue(next)
        pubSub.publish(next)
      },
    }
  }
}

export const createSharedReduce = <V extends object>(initValue: V) => {
  const pubSub = createPubSub<V>()

  return () => {
    const [state, dispatch] = useReducer(
      (prev: V, next: Partial<V>) => ({ ...prev, ...next }),
      initValue,
    )

    useEffect(() => {
      const unsubscribe = pubSub.subscribe(v => dispatch(v as Partial<V>))
      return () => unsubscribe()
    }, [])

    return {
      state,
      setState: (update: Partial<V>) => {
        const nextState = { ...state, ...update }
        dispatch(update)
        pubSub.publish(nextState)
      },
    }
  }
}

export type Reducer<S, M> = (state: S, message: M) => S

export const createSharedReducer = <S, M>(
  reducer: Reducer<S, M>,
  initialState: S,
) => {
  const pubSub = createPubSub<S>()

  return () => {
    const [value, setValue] = useState(initialState)

    useEffect(() => {
      const unsubscribe = pubSub.subscribe(setValue)
      return () => unsubscribe()
    }, [])

    return {
      state: value,
      sendMessage: (message: M) => {
        const state = reducer(value, message)
        setValue(state)
        pubSub.publish(state)
      },
    }
  }
}

type Action<V> = (v: V, ...args: any[]) => Partial<V> | V
type ActionsMap<V> = Record<string, Action<V>>
type ActionsAPI<V, A extends ActionsMap<V>> = {
  [K in keyof A]: (
    ...args: Parameters<A[K]> extends [any, ...infer P] ? P : never
  ) => void
}

type Selector<V> = (v: V, ...args: any[]) => any
type SelectorsMap<V> = Record<string, Selector<V>>
type SelectorAPI<V, S extends SelectorsMap<V>> = {
  [K in keyof S]: ReturnType<S[K]>
}

type CreateShared<
  V,
  S extends SelectorsMap<V> = {},
  U extends ActionsMap<V> = {},
> = () => {
  state: V
  setState: (updater: V | ((current: V) => V)) => void
  actions: ActionsAPI<V, U>
  selectors: SelectorAPI<V, S>
}

export function createShared<
  V,
  S extends SelectorsMap<V> = {},
  A extends ActionsMap<V> = {},
>(initValue: V, api: { selectors?: S; actions?: A }): CreateShared<V, S, A> {
  const { selectors, actions } = api
  const pubSub = createPubSub<V>()

  const mergeState = (state: V, update: Partial<V> | V | ((state: V) => V)): V => {
    if (typeof update === 'function') {
      return (update as (state: V) => V)(state)
    }
    return { ...state, ...update }
  }

  return () => {
    const [value, dispatch] = useReducer(mergeState, initValue)

    useEffect(() => {
      const unsubscribe = pubSub.subscribe((update: V | Partial<V>) => {
        dispatch(update)
      })

      return () => unsubscribe()
    }, [])

    const selectorsAPI = useMemo(() => {
      if (!selectors) {
        return {} as SelectorAPI<V, S>
      }

      return Object.fromEntries(
        Object.entries(selectors).map(([key, selectorFn]) => [
          key,
          createMemoizedSelector(selectorFn)(value),
        ]),
      ) as SelectorAPI<V, S>
    }, [value])

    const actionsAPI = useMemo(() => {
      if (!actions) {
        return {} as ActionsAPI<V, A>
      }

      return Object.fromEntries(
        Object.entries(actions).map(([key, updaterFn]) => [
          key,
          (...args: any[]) => {
            const result = updaterFn(value, ...args)
            const next = mergeState(value, result)
            dispatch(result)
            pubSub.publish(next)
          },
        ]),
      ) as ActionsAPI<V, A>
    }, [value])

    const setState = useCallback(
      (updater: V | ((current: V) => V)) => {
        const next = mergeState(value, updater)
        dispatch(updater)
        pubSub.publish(next)
      },
      [value],
    )

    return {
      state: value,
      setState,
      selectors: selectorsAPI,
      actions: actionsAPI,
    }
  }
}

const createMemoizedSelector = <V, R>(selector: (v: V) => R) => {
  let lastValue: V
  let lastResult: R

  return (value: V) => {
    if (value !== lastValue) {
      lastValue = value
      lastResult = selector(value)
    }

    return lastResult
  }
}
