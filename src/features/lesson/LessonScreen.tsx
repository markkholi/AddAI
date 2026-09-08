import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BigButton } from '../../components/BigButton/BigButton';
import { Card } from '../../components/Card/Card';
import { Mascot } from '../../components/Mascot/Mascot';
import { getLesson } from '../../data/lessons';
import { TeachVisual } from './TeachVisual';
import styles from './LessonScreen.module.css';

export function LessonScreen() {
  const { lessonId = '' } = useParams();
  const lesson = getLesson(lessonId);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    document.getElementById('page-heading')?.focus();
  }, [step]);

  if (!lesson) {
    return <Navigate to="/" replace />;
  }

  const current = lesson.steps[step];
  if (!current) {
    return <Navigate to="/" replace />;
  }
  const last = step === lesson.steps.length - 1;

  return (
    <section className={styles.page}>
      <div className={styles.top}>
        <Mascot mood="idle" />
        <p className={styles.kicker}>
          {lesson.icon} {lesson.title}
        </p>
      </div>
      <h1 id="page-heading" tabIndex={-1}>
        {current.heading}
      </h1>
      <Card className={styles.visual}>
        <TeachVisual kind={current.illustration} />
      </Card>
      <p className={styles.body}>{current.body}</p>
      <div className={styles.actions}>
        <BigButton
          variant="secondary"
          onClick={() => {
            if (step === 0) {
              navigate('/');
              return;
            }
            setStep((value) => value - 1);
          }}
        >
          Back
        </BigButton>
        <BigButton
          onClick={() => {
            if (last) {
              navigate(`/lesson/${lesson.id}/practice`);
              return;
            }
            setStep((value) => value + 1);
          }}
        >
          {last ? "Let's practice!" : 'Next'}
        </BigButton>
      </div>
    </section>
  );
}
