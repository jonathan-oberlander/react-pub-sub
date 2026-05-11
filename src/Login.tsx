import { useRef } from 'react'
import { createShared } from './createShared'
import classes from './Login.module.css'
import { email_regex, password_regex } from './utils'

const initialState = {
  email: '',
  password: '',
}

type State = typeof initialState

const useFormState = createShared(initialState, {
  actions: {
    setEmail: (_: State, email: string) => ({ email }),
    setPassword: (_: State, password: string) => ({ password }),
    reset: () => initialState,
  },
  selectors: {
    validation: ({ email, password }: State) => ({
      email: email.length > 1 && !email_regex.test(email) ? 'Not an email' : null,
      password:
        password.length > 1 && !password_regex.test(password)
          ? 'Invalid password'
          : null,
    }),
  },
})

type FormElements<T> = HTMLFormControlsCollection & {
  [K in keyof T]: HTMLInputElement
}

type LoginForm = HTMLFormElement & {
  readonly elements: FormElements<State>
}

export function Login() {
  const formRef = useRef<HTMLFormElement>(null)

  const {
    state,
    actions: { setEmail, setPassword, reset },
    selectors: { validation },
  } = useFormState()

  const handleSubmit = (event: React.FormEvent<LoginForm>) => {
    event.preventDefault()
    const { email, password } = event.currentTarget.elements

    if (!Object.values(validation).some(Boolean)) {
      console.log(email.value, password.value)
      console.log(new FormData(formRef.current ?? undefined))
    }
  }

  return (
    <form className={classes.login} ref={formRef} onSubmit={handleSubmit}>
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
      {validation.email && <span>{validation.email}</span>}
      <label>
        Password:
        <input
          type="password"
          name="password"
          value={state.password}
          onChange={e => {
            setPassword(e.currentTarget.value)
          }}
        />
      </label>
      {validation.password && <span>{validation.password}</span>}
      <button type="button" onClick={reset}>
        Reset
      </button>
      <button type="submit">Submit</button>
    </form>
  )
}

export function Debug() {
  const state = useFormState()

  return <pre>{JSON.stringify(state, null, 3)}</pre>
}
