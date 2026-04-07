import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import EntradaFormPage from "./pages/EntradaFormPage";
import HistorialPage from "./pages/HistorialPage";
import ImpresionPage from "./pages/ImpresionPage";
import ClientesPage from "./pages/ClientesPage";
import UsuariosPage from "./pages/UsuariosPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EntradaFormPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/historial"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HistorialPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ClientesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <AppLayout>
                <UsuariosPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/impresion/:id"
          element={
            <ProtectedRoute>
              <ImpresionPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
