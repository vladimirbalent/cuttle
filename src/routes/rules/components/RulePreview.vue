<template>
  <div class="rule-preview">
    <v-img
      v-if="!animate"
      :src="staticImg"
      :alt="`How to play ${title} in Cuttle`"
      aspect-ratio="1.7778"
    />
    <v-img
      v-else
      :src="animatedImg"
      :alt="`Animated preview of ${title} in Cuttle`"
      aspect-ratio="1.7778"
    />
    <p class="mt-2">
      <v-icon
        v-if="icon"
        color="black"
        class="mr-2"
        :icon="`mdi-${icon}`"
        :aria-label="`${title} move choice icon`"
        aria-hidden="false"
        role="img"
      />
      <strong>{{ title }}:</strong>
      {{ description }}
    </p>
    <div class="d-flex justify-center">
      <v-btn :color="buttonColor" variant="outlined" @click="toggleAnimate" data-cy="rule-preview-button">
        <v-icon :icon="buttonIcon" />
        {{ buttonText }}
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RulePreview',
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    animatedImg: {
      type: String,
      default: '',
    },
    staticImg: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '',
    },
  },
  emits: ['animate'],
  data() {
    return {
      animate: false,
    };
  },
  computed: {
    buttonText() {
      return this.animate ? 'Stop' : `${this.title}`;
    },
    buttonIcon() {
      return this.animate ? 'mdi-stop' : 'mdi-play';
    },
    buttonColor() {
      return this.animate ? 'secondary' : 'primary';
    },
  },
  methods: {
    toggleAnimate() {
      this.animate = !this.animate;
      this.$emit('animate', this);
    },
  },
};
</script>
