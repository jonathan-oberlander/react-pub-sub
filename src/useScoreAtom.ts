import { createAtomConfig } from "./atom"

const initialState = 0

export const useScoreAtom = createAtomConfig(
  initialState,
  {
    // updaters
    add: (current: number, amount: number) => current + amount,
    increment: (current: number) => current + 1,
    multiply: (current: number, factor: number) => current * factor,
    reset: () => initialState,
  },
  {
    // selectors
    $doubled: (current: number) => 2 * current,
    $text: (current: number) => `The current value is ${current}`,
    $times: (current: number, v: number) => v * current,
  }
)