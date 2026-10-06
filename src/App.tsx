/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WorkmateProvider, useWorkmate } from './context/WorkmateContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { WorkersView } from './components/workers/WorkersView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { WagesView } from './components/wages/WagesView';
import { BudgetView } from './components/budget/BudgetView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { ChatView } from './components/chat/ChatView';
import { EmergencyView } from './components/emergency/EmergencyView';
import { BillScannerView } from './components/scanner/BillScannerView';
import { MaterialsView } from './components/materials/MaterialsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SiteProgressView } from './components/progress/SiteProgressView';
import { DailyReportView } from './components/dailyreport/DailyReportView';
import { LocationAttendanceView } from './components/attendance/LocationAttendanceView';
import { ProfileView } from './components/profile/ProfileView';
import { SplashScreen } from './components/auth/SplashScreen';
import { AuthModal } from './components/auth/AuthModal';
import { VoiceCommandsModal } from './components/voice/VoiceCommandsModal';

const MainContent: React.FC = () => {
  const { activeTab } = useWorkmate();

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-20 sm:pb-8">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'workers' && <WorkersView />}
      {activeTab === 'attendance' && <AttendanceView />}
      {activeTab === 'wages' && <WagesView />}
      {activeTab === 'budget' && <BudgetView />}
      {activeTab === 'expenses' && <ExpensesView />}
      {activeTab === 'reports' && <ReportsView />}
      {activeTab === 'materials' && <MaterialsView />}
      {activeTab === 'chat' && <ChatView />}
      {activeTab === 'scanner' && <BillScannerView />}
      {activeTab === 'emergency' && <EmergencyView />}
      {activeTab === 'notifications' && <NotificationsView />}
      {activeTab === 'site_progress' && <SiteProgressView />}
      {activeTab === 'daily_report' && <DailyReportView />}
      {activeTab === 'location_attendance' && <LocationAttendanceView />}
      {(activeTab === 'profile' || activeTab === 'settings') && <ProfileView />}
    </main>
  );
};

const AppLayout: React.FC = () => {
  const {
    showSplash,
    setShowSplash,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
  } = useWorkmate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}
      <Header />
      <BottomNav />
      <div className="flex-1">
        <MainContent />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <VoiceCommandsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <WorkmateProvider>
      <AppLayout />
    </WorkmateProvider>
  );
}

