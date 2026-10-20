import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { CommandCenter } from './pages/CommandCenter';
import { Facility3DPage } from './pages/Facility3DPage';
import { IncidentManagement } from './pages/IncidentManagement';
import { SimulationStudio } from './pages/SimulationStudio';
import { InvestigationCenter } from './pages/InvestigationCenter';
import { WhatIfAnalysis } from './pages/WhatIfAnalysis';
import { EmergencyResources } from './pages/EmergencyResources';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { GuidedDemo } from './pages/GuidedDemo';
import { ProjectInfo } from './pages/ProjectInfo';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<CommandCenter />} />
          <Route path="facility" element={<Facility3DPage />} />
          <Route path="incidents" element={<IncidentManagement />} />
          <Route path="simulation" element={<SimulationStudio />} />
          <Route path="investigation" element={<InvestigationCenter />} />
          <Route path="what-if" element={<WhatIfAnalysis />} />
          <Route path="resources" element={<EmergencyResources />} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="guided-demo" element={<GuidedDemo />} />
          <Route path="project-info" element={<ProjectInfo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
