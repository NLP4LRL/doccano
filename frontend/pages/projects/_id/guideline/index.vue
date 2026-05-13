<template>
  <div style="height: 100%">
    <v-alert v-if="!isProjectAdmin" type="info" text dense class="ma-4">
      {{ $t('guideline.readOnly') }}
    </v-alert>
    <editor
      v-if="isProjectAdmin && loaded"
      ref="toastuiEditor"
      :initial-value="project.guideline"
      :options="editorOptions"
      preview-style="vertical"
      height="inherit"
      @change="updateProject"
    />
    <viewer
      v-else-if="!isProjectAdmin && loaded"
      :initial-value="project.guideline"
      :options="editorOptions"
    />
  </div>
</template>

<script>
import '@/assets/style/editor.css'
import { Editor, Viewer } from '@toast-ui/vue-editor'
import 'codemirror/lib/codemirror.css'
import _ from 'lodash'
import 'tui-editor/dist/tui-editor-contents.css'
import 'tui-editor/dist/tui-editor.css'

export default {
  components: {
    Editor,
    Viewer
  },

  layout: 'project',

  middleware: ['check-auth', 'auth', 'setCurrentProject'],

  validate({ params }) {
    return /^\d+$/.test(params.id)
  },

  data() {
    return {
      editorOptions: {
        language: this.$t('toastui.localeCode')
      },
      project: {},
      mounted: false,
      loaded: false,
      isProjectAdmin: false
    }
  },

  watch: {
    loaded(val) {
      if (val && this.isProjectAdmin) {
        // Watch fires after Vue re-renders (child Editor is mounted and
        // this.editor is assigned). $nextTick ensures we are past all
        // pending DOM updates before calling setMarkdown.
        this.$nextTick(() => {
          if (this.$refs.toastuiEditor) {
            this.$refs.toastuiEditor.invoke('setMarkdown', this.project.guideline || '')
            this.mounted = true
          }
        })
      }
    }
  },

  async mounted() {
    const projectId = this.$route.params.id
    const member = await this.$repositories.member.fetchMyRole(projectId)
    this.isProjectAdmin = member.isProjectAdmin
    this.project = await this.$services.project.findById(projectId)
    this.loaded = true
    if (!this.isProjectAdmin) {
      this.mounted = true
    }
  },

  methods: {
    updateProject: _.debounce(function () {
      if (this.mounted && this.isProjectAdmin) {
        this.project.guideline = this.$refs.toastuiEditor.invoke('getMarkdown')
        this.$services.project.update(this.$route.params.id, this.project)
      }
    }, 1000)
  }
}
</script>

<style>
.te-md-container .CodeMirror,
.tui-editor-contents {
  font-size: 20px;
}
</style>
