import { useScoreAtom } from './useScoreAtom'
import classes from './App.module.css'
import { useRef } from 'react'
import { createAtomConfig } from './atom'

function Updaters() {
  const { add, multiply, reset, increment } = useScoreAtom()

  return (
    <>
      <h2>Updaters</h2>
      <button onClick={() => increment()}>Inc</button>
      <button onClick={() => add(11)}>Add 11</button>
      <button onClick={() => multiply(2)}>Mult 2</button>
      <button onClick={reset}>Reset</button>
    </>
  )
}

function Selectors() {
  const { $doubled, $times, $text } = useScoreAtom()

  return (
    <>
      <h2>Selectors</h2>
      <p>{$text()}</p>
      <p>$doubled: {$doubled()}</p>
      <p>$times 6: {$times(6)}</p>
    </>
  )
}

export default function App() {
  return (
    <div className={classes.App}>
      {/* <Updaters />
      <Selectors /> */}
      <Login />
      <Debug />
    </div>
  )
}

type FormState = {
  email: string
  password: string
  emailError: string | null
  passwordError: string | null
}

type MyFormElements<T> = HTMLFormControlsCollection & {
  [K in keyof T]: HTMLInputElement
}

type UserForm = HTMLFormElement & {
  readonly elements: MyFormElements<FormState>
}

const initialState: FormState = {
  email: '',
  password: '',
  emailError: null,
  passwordError: null,
}

type Errors = { email: string | null; password: string | null }

const useFormState = createAtomConfig(
  initialState,
  {
    setErrors: (state: FormState, errors: Errors) => {
      return {
        ...state,
        emailError: errors.email ?? state.emailError ?? null,
        passwordError: errors.password ?? state.passwordError ?? null,
      }
    },
    setEmail: (state: FormState, email: string): FormState => ({
      ...state,
      email,
      emailError: null,
    }),
    setPassword: (state: FormState, password: string): FormState => ({
      ...state,
      password,
      passwordError: null,
    }),
    reset: () => initialState,
  },
  {}
)

function Login() {
  const formRef = useRef<HTMLFormElement>(null)
  const { setEmail, setPassword, setErrors, state, reset } = useFormState()

  const handleSubmit = (event: React.FormEvent<UserForm>) => {
    event.preventDefault()

    const { email, password } = event.currentTarget.elements
    const error: Errors = {
      email: email.value.length <= 1 ? 'Email is too short' : null,
      password: password.value?.length <= 1 ? 'Password is too short' : null,
    }

    setErrors(error)

    if (email.value && password.value) {
      console.log(email.value, password.value)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <label>
        Email:
        <input
          type="text"
          name="email"
          value={state.email}
          onChange={e => {
            setEmail(e.currentTarget.value)
          }}
        />
      </label>
      {state.emailError && <span>{state.emailError}</span>}
      <label>
        Password:
        <input
          type="text"
          name="password"
          value={state.password}
          onChange={e => {
            setPassword(e.currentTarget.value)
          }}
        />
      </label>
      {state.passwordError && <span>{state.passwordError}</span>}
      <button type="button" onClick={reset}>
        Reset
      </button>
      <button type="submit">Submit</button>
    </form>
  )
}

function Debug() {
  const state = useFormState()

  return <pre>{JSON.stringify(state, null, 3)}</pre>
}
