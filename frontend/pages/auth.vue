<template>
  <v-app id="inspire">
    <v-main class="auth-bg">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <div class="text-center mb-6">
              <img
                src="~/assets/nlp4lrl-logo-light.png"
                alt="NLP4LRL"
                class="auth-logo"
              />
            </div>
            <form-login :login="authenticateUser" />
            <social-login :fetch-social-link="fetchSocialLink" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'
import FormLogin from '@/components/auth/FormLogin.vue'
import SocialLogin from '@/components/auth/SocialLogin.vue'

export default Vue.extend({
  components: {
    FormLogin,
    SocialLogin
  },

  methods: {
    ...mapActions('auth', ['authenticateUser', 'fetchSocialLink'])
  }
})
</script>

<style scoped>
.auth-bg {
  background: linear-gradient(135deg, #1e293b 0%, #1e40af 60%, #2563eb 100%);
  min-height: 100vh;
}
.auth-logo {
  max-height: 120px;
  max-width: 340px;
}
</style>
