import React, { useState, useEffect } from 'react';
import { StudentHeader } from './components/layout/StudentHeader';
import { TeacherLayout } from './components/layout/TeacherLayout';

// Student Pages
import { CityMapPage } from './pages/student/CityMapPage';
import { JourneyMapPage } from './pages/student/JourneyMapPage';
import { StageLearningPage } from './pages/student/StageLearningPage';
import { BackpackPage } from './pages/student/BackpackPage';
import { NotebookPage } from './pages/student/NotebookPage';
import { CertificatePage } from './pages/student/CertificatePage';

// Teacher Pages
import { TeacherOverviewPage } from './pages/teacher/TeacherOverviewPage';
import { TeacherJourneysPage } from './pages/teacher/TeacherJourneysPage';
import { QuickContentEditorPage } from './pages/teacher/QuickContentEditorPage';
import { TeacherPreviewPage } from './pages/teacher/TeacherPreviewPage';
import { TeacherOfflinePage } from './pages/teacher/TeacherOfflinePage';
import { TeacherDemoPage } from './pages/teacher/TeacherDemoPage';
import { TeacherBackupPage } from './pages/teacher/TeacherBackupPage';

import { seedDefaultCurriculum } from './services/curriculumService';
import { getStudentProfile } from './services/profileService';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [studentStars, setStudentStars] = useState<number>(10);
  const [isReady, setIsReady] = useState(false);

  // Initialize Service Worker and Curriculum Seed
  useEffect(() => {
    seedDefaultCurriculum().then(() => {
      getStudentProfile().then((p) => {
        setStudentStars(p.totalStars);
        setIsReady(true);
      });
    });

    // Register Service Worker for offline PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', route);
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-sky-500/25 animate-bounce mb-4">
          🚦
        </div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">
          THÀNH PHỐ AN TOÀN
        </h1>
        <p className="text-xs text-sky-700 font-bold mt-1 animate-pulse">
          Đang chuẩn bị hành trình học tập số...
        </p>
      </div>
    );
  }

  // Parse Route Parameters
  const isTeacherRoute = currentRoute.startsWith('/teacher');

  // Teacher routing
  if (isTeacherRoute) {
    let teacherContent = <TeacherOverviewPage onNavigate={navigateTo} />;

    if (currentRoute === '/teacher/journeys') {
      teacherContent = (
        <TeacherJourneysPage
          onNavigateToQuickEditor={(jId) => navigateTo(`/teacher/journeys/${jId}/quick`)}
          onNavigateToPreview={(jId) => navigateTo(`/teacher/preview?journeyId=${jId}`)}
        />
      );
    } else if (currentRoute.startsWith('/teacher/journeys/')) {
      const match = currentRoute.match(/\/teacher\/journeys\/([^/]+)/);
      const journeyId = match ? match[1] : 'g2-l2';
      teacherContent = (
        <QuickContentEditorPage
          journeyId={journeyId}
          onBack={() => navigateTo('/teacher/journeys')}
          onNavigateToPreview={(jId) => navigateTo(`/teacher/preview?journeyId=${jId}`)}
        />
      );
    } else if (currentRoute.startsWith('/teacher/preview')) {
      const urlParams = new URLSearchParams(window.location.search);
      const jId = urlParams.get('journeyId') || 'g2-l2';
      teacherContent = (
        <TeacherPreviewPage
          initialJourneyId={jId}
          onNavigateToJourney={(id) => navigateTo(`/journey/${id}`)}
        />
      );
    } else if (currentRoute === '/teacher/offline') {
      teacherContent = <TeacherOfflinePage />;
    } else if (currentRoute === '/teacher/demo') {
      teacherContent = <TeacherDemoPage onNavigateStudent={navigateTo} />;
    } else if (currentRoute === '/teacher/backup') {
      teacherContent = <TeacherBackupPage />;
    }

    return (
      <TeacherLayout currentRoute={currentRoute} onNavigate={navigateTo}>
        {teacherContent}
      </TeacherLayout>
    );
  }

  // Student routing
  let studentContent = <CityMapPage onSelectJourney={(id) => navigateTo(`/journey/${id}`)} />;

  if (currentRoute.startsWith('/journey/') || currentRoute.startsWith('/mission/')) {
    const stageMatch = currentRoute.match(/\/(?:journey|mission)\/(.*?)\/(?:stage|stop)\/(.*)/);
    const journeyMatch = currentRoute.match(/\/(?:journey|mission)\/(.*?)$/);

    if (stageMatch) {
      const journeyId = stageMatch[1];
      const stageId = stageMatch[2];
      studentContent = (
        <StageLearningPage
          journeyId={journeyId}
          stageId={stageId}
          onBackToJourneyMap={() => navigateTo(`/journey/${journeyId}`)}
          onGoToNextStage={(nextStageId) => navigateTo(`/journey/${journeyId}/stage/${nextStageId}`)}
          onViewCertificate={() => navigateTo(`/certificate/${journeyId}`)}
        />
      );
    } else if (journeyMatch) {
      const journeyId = journeyMatch[1];
      studentContent = (
        <JourneyMapPage
          journeyId={journeyId}
          onBackToCity={() => navigateTo('/')}
          onSelectStage={(stageId) => navigateTo(`/journey/${journeyId}/stage/${stageId}`)}
          onViewCertificate={() => navigateTo(`/certificate/${journeyId}`)}
        />
      );
    }
  } else if (currentRoute === '/inventory') {
    studentContent = <BackpackPage onBackToCity={() => navigateTo('/')} />;
  } else if (currentRoute === '/notebook') {
    studentContent = <NotebookPage onBackToCity={() => navigateTo('/')} />;
  } else if (currentRoute.startsWith('/certificate/')) {
    const certMatch = currentRoute.match(/\/certificate\/(.*)/);
    const journeyId = certMatch ? certMatch[1] : 'g2-l2';
    studentContent = (
      <CertificatePage
        journeyId={journeyId}
        onBack={() => navigateTo(`/journey/${journeyId}`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-sky-50/70 flex flex-col font-['Nunito',sans-serif]">
      {/* Student App Navigation Header */}
      <StudentHeader
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        starsCount={studentStars}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 max-w-6xl w-full mx-auto">
        {studentContent}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-sky-100 bg-white/70 backdrop-blur-xs py-4 px-6 text-center text-xs text-slate-500 font-semibold flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl mx-auto w-full">
        <div>
          <span>Thành Phố An Toàn © 2026 • “Mỗi lựa chọn đúng – Thành phố thêm an toàn”</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/teacher')}
            className="text-slate-400 hover:text-sky-600 transition-colors"
          >
            Dành cho Thầy/Cô (Teacher Studio)
          </button>
        </div>
      </footer>
    </div>
  );
}
