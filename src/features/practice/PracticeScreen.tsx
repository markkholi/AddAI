import { useEffect, useReducer, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FeedbackBanner } from '../../components/FeedbackBanner/FeedbackBanner';
import { Mascot } from '../../components/Mascot/Mascot';
import { ProgressDots, type DotState } from '../../components/ProgressDots/ProgressDots';
import { EXERCISE_BANKS } from '../../data/exercises';
import { getLesson, isLessonId } from '../../data/lessons';
import { pickN } from '../../lib/shuffle';
import { playCorrect, playWrong } from '../../lib/sound';
import { ExerciseRenderer } from './ExerciseRenderer';
import { createSession, sessionReducer } from './sessionReducer';
import styles from './PracticeScreen.module.css';

export function PracticeScreen() {
  const { lessonId = '' } = useParams();
  const navigate = useNavigate();
  const lesson = getLesson(lessonId);
  const [exercises] = useState(() =>
    isLessonId(lessonId) ? pickN(EXERCISE_BANKS[lessonId], 5) : [],
  );
  const [sessionId] = useState(() => crypto.randomUUID());
  const [state, dispatch] = useReducer(sessionReducer, exercises, createSession);

  useEffect(() => {
    if (state.phase === 'wrong') {
      playWrong();
      const timer = window.setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 700);
      return () => window.clearTimeout(timer);
    }
    if (state.phase === 'correct') {
      playCorrect();
      const timer = window.setTimeout(() => {
        if (state.index >= state.exercises.length - 1) {
          navigate(`/lesson/${lessonId}/results`, {
            state: { results: state.results, sessionId },
          });
          return;
        }
        dispatch({ type: 'ADVANCE' });
      }, 900);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [state.phase, state.index, state.exercises.length, state.results, lessonId, navigate, sessionId]);

  if (!lesson || !isLessonId(lessonId) || exercises.length === 0) {
    return <Navigate to="/" replace />;
  }

  const exercise = state.exercises[state.index];
  if (!exercise) {
    return <Navigate to="/" replace />;
  }

  const dots = Array.from({ length: 5 }, (_, index) => dotState(state, index));
  const mood =
    state.phase === 'correct' ? 'cheer' : state.phase === 'wrong' ? 'oops' : 'think';
  const feedback =
    state.phase === 'correct'
      ? { variant: 'success' as const, message: 'Nice work!' }
      : state.phase === 'wrong' || state.attemptsForCurrent > 0
        ? { variant: 'warn' as const, message: `Not yet — try again! ${exercise.hint}` }
        : { variant: 'idle' as const, message: '' };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <Mascot mood={mood} />
        <div>
          <p className={styles.kicker}>{lesson.title}</p>
          <h1 id="page-heading" tabIndex={-1}>
            {exercise.prompt}
          </h1>
        </div>
      </header>
      <ProgressDots states={dots} />
      <div className={styles.body}>
        <ExerciseRenderer
          key={exercise.id}
          exercise={exercise}
          locked={state.phase !== 'answering'}
          onAnswer={(correct) => dispatch({ type: 'ANSWER', correct })}
        />
      </div>
      <footer className={styles.footer}>
        <FeedbackBanner variant={feedback.variant} message={feedback.message} />
      </footer>
    </section>
  );
}

function dotState(
  state: { index: number; results: { attempts: number }[]; phase: string },
  index: number,
): DotState {
  if (index < state.results.length) {
    return state.results[index]?.attempts === 1 ? 'first-try' : 'retried';
  }
  if (index === state.index && state.phase === 'correct') {
    return state.results[index]?.attempts === 1 ? 'first-try' : 'retried';
  }
  return 'pending';
}
