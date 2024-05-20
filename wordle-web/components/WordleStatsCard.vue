<template>
  <v-card elevation="4">
    <v-sheet color="primary" class="py-2">
      <V-card-title v-if="isDaily">{{ formattedDate }}</V-card-title>
      <v-card-title v-else>{{ gameStat.word }}</v-card-title>
    </v-sheet>
    <v-row class="mt-1">
      <v-col class="ml-2">
        <v-card-text class="font-weight-bold text-h6"
          >Total Wins: {{ gameStat.totalWins }}</v-card-text
        >
        <v-card-text class="font-weight-bold text-h6"
          >Total Losses: {{ gameStat.totalLosses }}</v-card-text
        >
        <v-card-text class="font-weight-bold text-h6"
          >Average Seconds {{ gameStat.averageSeconds }}</v-card-text
        >
      </v-col>
      <v-col>
        <v-card-item
          class="text-center font-weight-bold d-flex flex-column align-cetner"
        >
          <v-card-text class="font-weight-bold text-h6"
            >Average Attempts</v-card-text
          >
          <v-progress-circular
            :rotate="360"
            :width="5"
            color="win"
            class="mx-auto font-weight-bold"
            size="75"
            :model-value="averageAttempts"
          >
            {{ averageAttempts }}%</v-progress-circular
          >
        </v-card-item>
        <v-card-item class="text-center d-flex flex-column align-cetner">
          <v-card-text class="font-weight-bold text-h6"
            >Win Percentage</v-card-text
          >
          <v-progress-circular
            :rotate="360"
            :width="5"
            color="warning"
            class="mx-auto font-weight-bold"
            size="75"
            :model-value="winPercentage"
          >
            {{ winPercentage }}%</v-progress-circular
          >
        </v-card-item>
      </v-col>
    </v-row>
    <v-card-actions class="py-5"> </v-card-actions>
    <v-sheet color="primary" height="5px" />
  </v-card>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import type { GameStats } from "~/Models/GameStas";

const props = withDefaults(
  defineProps<{
    gameStat: GameStats;
    isDaily: boolean;
    hasPlayed: boolean;
    inCurrentGame: boolean;
  }>(),
  {
    hasPlayed: false,
    isDaily: false,
    inCurrentGame: true,
  }
);

const winPercentage = computed(() => {
  if (props.gameStat.totalGames === 0) {
    return 0; // or any other default value
  }
  return (props.gameStat.totalWins / props.gameStat.totalGames) * 100;
});

const averageAttempts = computed(() => {
  return ((props.gameStat.averageGuesses / 6) * 100).toFixed(2);
});

const formattedDate = computed(() => {
  return format(new Date(props.gameStat.date), "MMMM dd, yyyy");
});
</script>