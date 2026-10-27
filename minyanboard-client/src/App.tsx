import { BrowserRouter, Routes, Route } from "react-router";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import BoardPage from "./pages/BoardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyMinyanimPage from "./pages/MyMinyanimPage";
import MinyanFormPage from "./pages/MinyanFormPage";
import AdminPage from "./pages/AdminPage";
// App היא "המפה" של האפליקציה: תפריט עליון + איזה דף מוצג בכל כתובת
function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main>
        <Routes>
          {/* פתוח לכולם */}
          <Route path="/" element={<BoardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* גבאי בלבד */}
          <Route path="/mine" element={<ProtectedRoute role="Gabbai"><MyMinyanimPage /></ProtectedRoute>} />
          <Route path="/mine/new" element={<ProtectedRoute role="Gabbai"><MinyanFormPage /></ProtectedRoute>} />
          <Route path="/mine/:id/edit" element={<ProtectedRoute role="Gabbai"><MinyanFormPage /></ProtectedRoute>} />


 <Route path="/admin" element={<ProtectedRoute role="Admin"><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<p>הדף לא נמצא</p>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
