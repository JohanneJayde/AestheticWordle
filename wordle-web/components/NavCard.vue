<template>
  <v-card
    :color="color"
    :to="`/${route}`"
    class="glow-btn d-flex pa-3"
    hover
    ripple
    rounded
  >
    <v-row :no-gutters="true">
      <v-col
        lg="3"
        sm="3"
        xs="12"
        class="d-flex align-center justify-center flex-column"
      >
        <v-icon size="x-large" :icon="icon" />
        <v-card-title class="font-weight-bold text-wrap text-center">{{
          title
        }}</v-card-title>
      </v-col>
      <v-col cols="9" v-if="$vuetify.display.smAndUp">
        <v-card-text class="text-left">
          {{ description }}
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped lang="scss"></style>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  icon: string;
  color: string;
  description: string;
}>();

const route = props.title.replace(" ", "");
</script>
