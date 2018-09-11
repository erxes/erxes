import { ThemedStyledFunction } from 'styled-components'

const withProps = <U>() => <P, T, O>(fn: ThemedStyledFunction<P, T, O>) =>
    fn as ThemedStyledFunction<P & U, T, O & U>

export { withProps }