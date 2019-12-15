<template>
<v-app>
  <v-app-bar app color="primary" dark>
    <div class="d-flex align-center">
      <span class="headline mr-2">Ptt analysis</span>
    </div>
  </v-app-bar>

  <v-content>
    <Page/>
  </v-content>
</v-app>
</template>

<script>
import Page from './components/Page';

export default {
  name: 'App',

  components: {
    Page,
  },

  data: () => ({
    //
  }),
};
</script>
