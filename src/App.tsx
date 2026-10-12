/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AssignmentReviewer4C } from './components/AssignmentReviewer4C';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AILearningAssistant } from './components/AILearningAssistant';
import { AITeacherAssistant } from './components/AITeacherAssistant';
import { DiscussionForum } from './components/DiscussionForum';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { ResponsibleAI } from './components/ResponsibleAI';
import { AdminDashboard } from './components/AdminDashboard';
import { SafeNetHub } from './components/safenet/SafeNetHub';

const AppContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {activeView === 'landing' && <LandingPage />}
        {activeView === 'reviewer_4c' && <AssignmentReviewer4C />}
        {activeView === 'safenet_ai' && <SafeNetHub />}
        {activeView === 'student_dashboard' && <StudentDashboard />}
        {activeView === 'teacher_dashboard' && <TeacherDashboard />}
        {activeView === 'tutor_chat' && <AILearningAssistant />}
        {activeView === 'teacher_ai' && <AITeacherAssistant />}
        {activeView === 'discussions' && <DiscussionForum />}
        {activeView === 'analytics' && <ProgressAnalytics />}
        {activeView === 'responsible_ai' && <ResponsibleAI />}
        {activeView === 'admin_dashboard' && <AdminDashboard />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
