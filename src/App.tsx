import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./component/HomePage";
import ImageResultListPage from "./layout/ImageResultListPage";
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* ルーティングの定義 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/result" element={<ImageResultListPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
