import { gql } from "@/lib/apollo-hooks";

export const GET_EXERCISES = gql`
  query GetExercises($page: Int, $size: Int, $filter: ExerciseFilter) {
    exercises(page: $page, size: $size, filter: $filter) {
      content {
        id
        name
        description
        muscleGroup
        equipment
        difficultyLevel
        videoUrl
      }
      totalPages
      totalElements
    }
  }
`;
