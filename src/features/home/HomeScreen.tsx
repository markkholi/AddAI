import { Link } from 'react-router-dom';
import { Card } from '../../components/Card/Card';
import { StarRating } from '../../components/StarRating/StarRating';
import { LESSONS } from '../../data/lessons';
import { useProgress } from '../progress/ProgressContext';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  const { state, resetAll } = useProgress();

  return (
    <section className={styles.page}>
      <h1 id="page-heading" tabIndex={-1} className={styles.title}>
        Adventure Map
      </h1>
      <p className={styles.lead}>Pick a lesson and start adding!</p>
      <div className={styles.grid}>
        {LESSONS.map((lesson, index) => {
          const progress = state.lessons[lesson.id];
          return (
            <Link key={lesson.id} to={`/lesson/${lesson.id}`} className={styles.cardLink}>
              <Card className={styles.card}>
                <span className={styles.badge} aria-hidden="true">
                  {index + 1}
                </span>
                <span className={styles.icon} aria-hidden="true">
                  {lesson.icon}
                </span>
                <h2>{lesson.title}</h2>
                <p>{lesson.subtitle}</p>
                <StarRating value={progress.bestStars} />
              </Card>
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        className={styles.reset}
        onClick={() => {
          if (window.confirm('Start over and clear your stars?')) {
            resetAll();
          }
        }}
      >
        Start over
      </button>
    </section>
  );
}
