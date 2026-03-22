import { useRoutes, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import HomeLanding from "./components/HomeLanding";
import AnalyzePage from "./pages/AnalyzePage";
import AnalyseClients from "./components/AnalyseClients";
import About from "./components/About";

export default function AppRoutes() {
  const routes = useRoutes([
    {
      path: "/",
      element: <AppLayout />,
      children: [
        { index: true, element: <HomeLanding /> },
        { path: "analyze", element: <AnalyzePage /> },
        {
          path: "clients",
          element: (
            <div className="content">
              <AnalyseClients />
            </div>
          ),
        },
        {
          path: "about",
          element: (
            <div className="content">
              <About />
            </div>
          ),
        },
        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ]);

  return routes;
}
