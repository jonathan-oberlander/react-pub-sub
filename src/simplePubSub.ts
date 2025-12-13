import { useState, useEffect } from 'react'

function atom<T>() {
  type Fn = (value: T) => void
  const set: Set<Fn> = new Set()

  return {
    suscribe(fn: Fn): () => void {
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

export const createAtom = <V>(initValue: V) => {
  const suscribers = atom<V>()

  return () => {
    const [value, setValue] = useState(initValue)

    useEffect(() => suscribers.suscribe(setValue), [])

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

    useEffect(() => suscribers.suscribe(setValue), [])

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



export const createAtomWithSelectors = <V>(initValue: V, selectors?: SelectorMap<V>) => {
  const subscribers = atom<V>()

  return () => {
    const [value, setValue] = useState(initValue)

    useEffect(() => subscribers.subscribe(setValue), [])

    const selectorsObj = useMemo(() => {
      if (!selectors) return {}
      return Object.fromEntries(
        Object.entries(selectors).map(([key, selectorFn]) => [
          key,
          () => selectorFn(value)
        ])
      )
    }, [value, selectors])

    return {
      state: value,
      setState: (updater: V | ((current: V) => V)) => {
        setValue(updater instanceof Function ? updater(value) : updater)
        subscribers.publish(updater instanceof Function ? updater(value) : updater)
      },
      ...selectorsObj,
    }
  }
}


export const createAtomFull = <V>(initValue: V, config: AtomConfig<V> = {}) => {
  const { selectors, updaters } = config
  const subscribers = atom<V>()

  return () => {
    const [value, setValue] = useState(initValue)

    useEffect(() => subscribers.suscribe(setValue), [])

    const selectorFns = useMemo(() => {
      if (!selectors) return {}
      return Object.fromEntries(
        Object.entries(selectors).map(([key, fn]) => [
          key,
          () => fn(value),
        ]),
      )
    }, [value, selectors])

    const updaterFns = useMemo(() => {
  if (!updaters) return {}
  return Object.fromEntries(
    Object.entries(updaters).map(([key, fn]) => {
      // Parameters<typeof fn> gives [V, ...Args]
      type FnArgs = Parameters<typeof fn>
      return [
        key,
        (...args: FnArgs) => {
          const next = fn(value, ...args.slice(1) as any[]) // Skip first V arg
          setValue(next)
          subscribers.publish(next)
        },
      ]
    }),
  ) as Record<keyof typeof updaters, any>
}, [value, updaters])

    const setState = (updater: V | ((current: V) => V)) => {
      const next =
        typeof updater === 'function' ? (updater as (c: V) => V)(value) : updater
      setValue(next)
      subscribers.publish(next)
    }

    return {
      state: value,
      setState,
      ...selectorFns,
      ...updaterFns,
    }
  }
}

const counterAtom = createAtom<number>(0, {
  updaters: {
    increment: (current: number) => current + 1,           // V = number
    add: (current: number, amount: number) => current + amount,  // V + number
    multiply: (current: number, factor: number) => current * factor,
  },
})

function Counter() {
  const counter = counterAtom()
  counter.increment()     // ✅ No args needed
  counter.add(5)          // ✅ Expects number  
  counter.multiply(3)     // ✅ Expects number
  // counter.add('hello') // ❌ TypeScript error!
}