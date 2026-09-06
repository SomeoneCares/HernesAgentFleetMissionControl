/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { ClusterProvider, useCluster } from './context/ClusterContext';
import { PetProvider } from './context/PetContext';
import { PluginsProvider } from './context/PluginsContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OverviewTab } from './components/OverviewTab';
import { AgentsTab } from './components/AgentsTab';
import { TasksTab } from './components/TasksTab';
import { ChatTab } from './components/ChatTab';
import { ContentLibraryTab } from './components/ContentLibraryTab';
import { CliModal } from './components/CliModal';
import { SkinSelectorModal } from './components/SkinSelectorModal';
import { SelfHostModal } from './components/SelfHostModal';
import { CyberPet } from './components/CyberPet';
import { CyberPetModal } from './components/CyberPetModal';
import { OperatorProfileModal } from './components/OperatorProfileModal';
import { PortalSettingsModal } from './components/PortalSettingsModal';
import { Zap, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { toast, portalSettings } = useCluster();
  const [activeTab, setActiveTab] = useState<TabType>(() => portalSettings?.preferences?.defaultLandingTab || 'overview');
  const [isCliOpen, setIsCliOpen] = useState<boolean>(false);
  const [isSkinsOpen, setIsSkinsOpen] = useState<boolean>(false);
  const [isSelfHostOpen, setIsSelfHostOpen] = useState<boolean>(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'connection' | 'storage' | 'branding' | 'preferences' | 'plugins' | 'backup'>('connection');

  // Synchronize document title with dynamic portal branding
  useEffect(() => {
    if (portalSettings?.branding?.portalName) {
      document.title = `${portalSettings.branding.portalName} • ${portalSettings.branding.portalTagline || 'Autonomous Mission Control'}`;
    }
  }, [portalSettings?.branding?.portalName, portalSettings?.branding?.portalTagline]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500/20 selection:text-cyan-400 relative overflow-x-hidden transition-colors duration-200">
      {/* Cybernetic Ambient Mesh Background */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none z-0 opacity-80" />
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Fixed Header with Comms & Tools */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCli={() => setIsCliOpen(true)}
        onOpenSkins={() => setIsSkinsOpen(true)}
        onOpenSelfHost={() => setIsSelfHostOpen(true)}
        onOpenPet={() => setIsPetModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => {
          setSettingsTab('connection');
          setIsSettingsOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 pt-36 px-4 sm:px-8 max-w-[1720px] mx-auto w-full">
        {activeTab === 'overview' && <OverviewTab onNavigateTab={setActiveTab} />}
        {activeTab === 'agents' && <AgentsTab />}
        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'library' && <ContentLibraryTab />}
      </main>

      {/* Interactive Cyber Pet Companion (Docked HUD) */}
      <CyberPet onOpenConfig={() => setIsPetModalOpen(true)} />

      {/* Aerospace Footer */}
      <Footer />

      {/* Global Interactive CLI Terminal Drawer */}
      <CliModal
        isOpen={isCliOpen}
        onClose={() => setIsCliOpen(false)}
      />

      {/* Visual Skin & Theme Designer Modal */}
      <SkinSelectorModal
        isOpen={isSkinsOpen}
        onClose={() => setIsSkinsOpen(false)}
      />

      {/* Self-Host & Deployment Modal (0 Extra Servers) */}
      <SelfHostModal
        isOpen={isSelfHostOpen}
        onClose={() => setIsSelfHostOpen(false)}
      />

      {/* Cyber Pet Companion Config Modal */}
      <CyberPetModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
      />

      {/* Operator Profile & Avatar Photo Modal */}
      <OperatorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Portal & Cluster Settings Modal (Includes Plugins & Extensions) */}
      <PortalSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
      />

      {/* Global Task/Pipeline Action Toast */}
      {toast && (
        <aside 
          aria-live="polite"
          className="fixed bottom-8 right-8 z-50 px-5 py-3.5 rounded-2xl bg-[#0c101a]/95 border border-cyan-400/40 text-cyan-300 font-mono text-xs flex items-center gap-3 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-fade-in"
        >
          <div className="w-6 h-6 rounded-lg bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200">{toast}</span>
        </aside>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PluginsProvider>
        <PetProvider>
          <ClusterProvider>
            <AppContent />
          </ClusterProvider>
        </PetProvider>
      </PluginsProvider>
    </ThemeProvider>
  );
}
