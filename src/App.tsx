import "./App.css";
import Home from "./components/Home";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <>
      <Home />
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
