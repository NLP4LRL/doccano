<template>
  <section class="nlp4lrl-cta">
    <v-container>
      <v-row align="center" justify="center" class="text-center py-10">
        <v-col cols="12" md="8">
          <h2 class="cta-title mb-4">{{ $t('home.footerTitle') }}</h2>
          <p class="cta-text mb-8">{{ $t('home.footerText') }}</p>
          <v-btn
            x-large
            color="#2563eb"
            dark
            :href="localePath('/auth')"
            class="cta-btn"
          >
            {{ $t('home.getStarted') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>

<style scoped>
.nlp4lrl-cta {
  background: #1e293b;
}
.cta-title {
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
}
.cta-text {
  font-size: 1.05rem;
  color: #94a3b8;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
}
.cta-btn {
  font-weight: 600;
  border-radius: 6px;
}
</style>
