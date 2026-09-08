import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { setMuted } from './lib/sound';
import { HomeScreen } from './features/home/HomeScreen';
import { LessonScreen } from './features/lesson/LessonScreen';
import { PracticeScreen } from './features/practice/PracticeScreen';
import { ResultsScreen } from './features/results/ResultsScreen';
import styles from './App.module.css';

export default function App() {
  const [muted, setMutedState] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const heading = document.getElementById('page-heading');
    heading?.focus();
  }, [location.pathname]);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            🐸
          </span>
          AddAI
        </Link>
        <button
          type="button"
          className={styles.mute}
          aria-pressed={!muted}
          onClick={() => {
            const next = !muted;
            setMutedState(next);
            setMuted(next);
          }}
        >
          {muted ? 'Sound off' : 'Sound on'}
        </button>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/lesson/:lessonId" element={<LessonScreen />} />
          <Route path="/lesson/:lessonId/practice" element={<PracticeScreen />} />
          <Route path="/lesson/:lessonId/results" element={<ResultsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
