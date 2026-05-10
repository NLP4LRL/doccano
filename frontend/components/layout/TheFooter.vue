<template>
  <v-footer color="primary lighten-1" padless>
    <v-layout justify-center wrap>
      <v-flex black lighten-2 py-4 text-center white--text xs12>
        &copy; {{ new Date().getFullYear() }}
        <a href="https://www.nlp4lrl.com" target="_blank" rel="noopener" class="footer-link">
          NLP4LRL
        </a>
        &mdash; Powered by
        <a
          href="https://github.com/doccano/doccano"
          target="_blank"
          rel="noopener"
          class="footer-link"
        >
          doccano
        </a>
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<style scoped>
.footer-link {
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}
.footer-link:hover {
  text-decoration: underline;
}
</style>
