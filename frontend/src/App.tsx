import { BrowserRouter, Routes, Route } from "react-router";
import Root from "./pages/root";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
