import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './component/HomePage';

function App() {

  return (
    <BrowserRouter>

    <div className="App">
      <Routes>
        {/* ルーティングの定義 */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>

    </BrowserRouter>
  );
}

export default App;