import React from 'react';
import { Wizard } from './components/wizard/Wizard';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Wizard />
    </div>
  );
};

export default App;
