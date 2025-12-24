import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import LicensesPage from "./pages/LicensesPage";
import DogsPage from "./pages/DogsPage";
import OwnersPage from "./pages/OwnersPage";
import KennelsPage from "./pages/KennelsPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* App Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <svg
                className="h-10 w-10 text-blue-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dog License Management System
                </h1>
                <p className="text-sm text-gray-600">Camrose, Alberta</p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <Navigation />

        {/* Page Content */}
        <Routes>
          <Route path="/" element={<LicensesPage />} />
          <Route path="/dogs" element={<DogsPage />} />
          <Route path="/owners" element={<OwnersPage />} />
          <Route path="/kennels" element={<KennelsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
