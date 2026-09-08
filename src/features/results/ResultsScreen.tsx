import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BigButton } from '../../components/BigButton/BigButton';
import { Mascot } from '../../components/Mascot/Mascot';
import { StarRating } from '../../components/StarRating/StarRating';
import { getLesson, nextLessonId } from '../../data/lessons';
import { firstTryCount, messageForStars, starsFor } from '../../lib/grading';
import type { ResultsLocationState } from '../../types';
import { useProgress } from '../progress/ProgressContext';
import styles from './ResultsScreen.module.css';

export function ResultsScreen() {
  const { lessonId = '' } = useParams();
  const lesson = getLesson(lessonId);
  const location = useLocation();
  const navigate = useNavigate();
  const { recordResult } = useProgress();
  const payload = location.state as ResultsLocationState | null;

  useEffect(() => {
    if (!lesson || !payload?.results || !payload.sessionId) {
      return;
    }
    const key = `addai.session.${payload.sessionId}`;
    try {
      if (sessionStorage.getItem(key)) {
        return;
      }
      sessionStorage.setItem(key, '1');
    } catch {
      // Ignore sessionStorage failure in restricted/private environments
    }
    recordResult(lesson.id, starsFor(payload.results));
  }, [lesson, payload, recordResult]);

  if (!lesson) {
    return <Navigate to="/" replace />;
  }
  if (!payload?.results) {
    return <Navigate to={`/lesson/${lesson.id}`} replace />;
  }

  const stars = starsFor(payload.results);
  const nextId = nextLessonId(lesson.id);

  return (
    <section className={styles.page}>
      <Mascot mood="cheer" />
      <h1 id="page-heading" tabIndex={-1}>
        You finished!
      </h1>
      <div className={styles.burst}>
        <StarRating value={stars} size="lg" animate />
      </div>
      <p className={styles.message}>{messageForStars(stars, firstTryCount(payload.results))}</p>
      <div className={styles.actions}>
        <BigButton onClick={() => navigate(`/lesson/${lesson.id}/practice`)}>Play again</BigButton>
        {nextId ? (
          <BigButton variant="secondary" onClick={() => navigate(`/lesson/${nextId}`)}>
            Next lesson
          </BigButton>
        ) : null}
        <BigButton variant="ghost" onClick={() => navigate('/')}>
          Back to map
        </BigButton>
      </div>
    </section>
  );
}
