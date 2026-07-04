import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import RockDetails from "./pages/RockDetails"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rock/:id" element={<RockDetails />} />
    </Routes>
  )
}