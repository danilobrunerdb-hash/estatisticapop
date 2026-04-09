import React from 'react';
import { ProjectionProvider } from './frontend/context/ProjectionContext';
import { Dashboard } from './frontend/pages/Dashboard';

export default function App() {
  return (
    <ProjectionProvider>
      <Dashboard />
    </ProjectionProvider>
  );
}
