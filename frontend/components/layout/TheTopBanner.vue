<template>
  <section>
    <div class="nlp4lrl-hero">
      <v-container class="fill-height">
        <v-row align="center" justify="center" class="text-center">
          <v-col cols="12">
            <img
              src="~/assets/nlp4lrl-logo-light.png"
              alt="NLP4LRL"
              class="hero-logo mb-6"
            />
            <h1 class="hero-title mb-3">{{ $t('home.mainTitle') }}</h1>
            <p class="hero-subtitle mb-8">{{ $t('home.mainSubtitle') }}</p>
            <v-btn
              x-large
              color="#2563eb"
              dark
              :href="localePath('/auth')"
              class="hero-btn"
            >
              {{ $t('home.getStarted') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>

<style scoped>
.nlp4lrl-hero {
  background: linear-gradient(135deg, #1e293b 0%, #1e40af 60%, #2563eb 100%);
  min-height: 420px;
  display: flex;
  align-items: center;
}
.hero-logo {
  max-height: 150px;
  max-width: 420px;
}
.hero-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: 0.01em;
}
.hero-subtitle {
  font-size: 1.15rem;
  color: #cbd5e1;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}
.hero-btn {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  border-radius: 6px;
}
</style>
