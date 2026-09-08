import { useState } from 'react';
import { CountableObject } from '../../../../components/CountableObject/CountableObject';
import { checkAnswer } from '../../../../lib/grading';
import type { CountObjectsExercise, ExerciseProps, ObjectIcon } from '../../../../types';
import styles from './CountObjects.module.css';

export function CountObjects({
  exercise,
  onAnswer,
  locked,
}: ExerciseProps<CountObjectsExercise>) {
  const [counted, setCounted] = useState<boolean[]>(() =>
    Array.from({ length: exercise.groups[0] + exercise.groups[1] }, () => false),
  );
  const [wrong, setWrong] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const left = exercise.groups[0];

  return (
    <div className={styles.wrap}>
      <div
        className={styles.scene}
        role="group"
        aria-label={`${exercise.groups[0]} ${plural(exercise.icon)} and ${exercise.groups[1]} ${plural(exercise.icon)}`}
      >
        <Cluster
          icon={exercise.icon}
          count={exercise.groups[0]}
          offset={0}
          counted={counted}
          locked={locked}
          onToggle={toggle}
        />
        <span className={styles.plus} role="img" aria-label="plus">
          +
        </span>
        <Cluster
          icon={exercise.icon}
          count={exercise.groups[1]}
          offset={left}
          counted={counted}
          locked={locked}
          onToggle={toggle}
        />
      </div>
      <div className={styles.choices}>
        {exercise.choices.map((choice) => {
          const isWrong = wrong.includes(choice);
          const isRight = picked === choice && !isWrong;
          return (
            <button
              key={choice}
              type="button"
              className={`${styles.choice} ${isWrong ? styles.wrong : ''} ${isRight ? styles.right : ''}`}
              disabled={locked || isWrong}
              onClick={() => choose(choice)}
              aria-label={`Answer ${choice}`}
            >
              {choice}
              {isRight ? <span aria-hidden="true"> ✓</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );

  function toggle(index: number) {
    setCounted((current) => current.map((value, i) => (i === index ? !value : value)));
  }

  function choose(choice: number) {
    const correct = checkAnswer(exercise, choice);
    setPicked(choice);
    if (!correct) {
      setWrong((current) => (current.includes(choice) ? current : [...current, choice]));
    }
    onAnswer(correct);
  }
}

function Cluster({
  icon,
  count,
  offset,
  counted,
  locked,
  onToggle,
}: {
  icon: ObjectIcon;
  count: number;
  offset: number;
  counted: boolean[];
  locked: boolean;
  onToggle: (index: number) => void;
}) {
  return (
    <div className={styles.cluster}>
      {Array.from({ length: count }, (_, index) => {
        const absolute = offset + index;
        return (
          <CountableObject
            key={absolute}
            icon={icon}
            counted={Boolean(counted[absolute])}
            disabled={locked}
            onToggle={() => onToggle(absolute)}
          />
        );
      })}
    </div>
  );
}

function plural(icon: ObjectIcon): string {
  if (icon === 'fish') {
    return 'fish';
  }
  return `${icon}s`;
}
