<template>
  <HelloWorld />

  <v-btn to="/examples">examples</v-btn>
  <v-btn to="/wireframes">wireframes</v-btn>
</template>

<script>
const x = "[/examples]";

export default {
  data: () => ({
  }),

  computed: {},

  watch: {},

  methods: {},

  mounted() {
    console.log(x, "mounted()", 1);
  },
};
</script>