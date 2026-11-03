/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FoodTruckProvider, useFoodTruck } from './context/FoodTruckContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/Auth/LoginScreen';
import { Header } from './components/Header';
import { PDVView } from './components/PDV/PDVView';
import { KDSView } from './components/KDS/KDSView';
import { CustomerTVView } from './components/TV/CustomerTVView';
import { MenuManagementView } from './components/Menu/MenuManagementView';
import { CashierReportsView } from './components/Reports/CashierReportsView';

const AppContent: React.FC = () => {
  const { activeView, setActiveView } = useFoodTruck();
  const { isAuthenticated, isLoading, isManager } = useAuth();

  React.useEffect(() => {
    if (activeView === 'menu' && !isManager) {
      setActiveView('pdv');
    }
  }, [activeView, isManager, setActiveView]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 text-stone-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#A91D22] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider uppercase text-stone-400">
            Carregando Sistema Rattan Pães...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />
      <main className="flex-1 flex flex-col">
        {activeView === 'pdv' && <PDVView />}
        {activeView === 'kds' && <KDSView />}
        {activeView === 'tv' && <CustomerTVView />}
        {activeView === 'menu' && isManager && <MenuManagementView />}
        {activeView === 'reports' && <CashierReportsView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FoodTruckProvider>
        <AppContent />
      </FoodTruckProvider>
    </AuthProvider>
  );
}
