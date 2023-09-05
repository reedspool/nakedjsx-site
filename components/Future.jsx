import { P } from "./Elements.jsx"

export const Future = ({ children, Wrap = P }) => {
    return <Wrap>Future: <span>{children}</span></Wrap>
}
