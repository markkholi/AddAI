import type { Exercise, ExerciseProps } from '../../types';
import { CountObjects } from './exercises/CountObjects/CountObjects';
import { NumberSentenceDrop } from './exercises/NumberSentenceDrop/NumberSentenceDrop';
import { TenFrameBuild } from './exercises/TenFrameBuild/TenFrameBuild';

export function ExerciseRenderer({ exercise, onAnswer, locked }: ExerciseProps<Exercise>) {
  switch (exercise.kind) {
    case 'count-objects':
      return <CountObjects exercise={exercise} onAnswer={onAnswer} locked={locked} />;
    case 'ten-frame-build':
      return <TenFrameBuild exercise={exercise} onAnswer={onAnswer} locked={locked} />;
    case 'number-sentence-drop':
      return <NumberSentenceDrop exercise={exercise} onAnswer={onAnswer} locked={locked} />;
    default: {
      const _never: never = exercise;
      return _never;
    }
  }
}
