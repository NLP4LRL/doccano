<template>
  <v-container class="project-home pa-6">
    <div class="mb-8">
      <h1 class="project-title mb-1">{{ currentProject.name }}</h1>
      <p class="project-subtitle mb-5">{{ $t('projectHome.subtitle') }}</p>
      <v-btn color="primary" large @click="toLabeling">
        <v-icon left>{{ mdiPlayCircleOutline }}</v-icon>
        {{ $t('home.startAnnotation') }}
      </v-btn>
    </div>

    <v-row>
      <v-col
        v-for="card in visibleCards"
        :key="card.link"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="action-card" outlined @click="navigate(card.link)">
          <v-card-title>
            <v-icon left color="primary">{{ card.icon }}</v-icon>
            {{ card.title }}
          </v-card-title>
          <v-card-text class="card-desc">{{ card.description }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  mdiDatabaseOutline,
  mdiLabelOutline,
  mdiAccountMultipleOutline,
  mdiBookOpenOutline,
  mdiChartBar,
  mdiCog,
  mdiPlayCircleOutline,
  mdiDownloadOutline,
  mdiUploadOutline
} from '@mdi/js'
import { mapGetters } from 'vuex'
import { getLinkToAnnotationPage } from '~/presenter/linkToAnnotationPage'

export default {
  layout: 'project',

  middleware: ['check-auth', 'auth', 'setCurrentProject'],

  validate({ params }) {
    return /^\d+$/.test(params.id)
  },

  data() {
    return {
      isProjectAdmin: false,
      mdiPlayCircleOutline
    }
  },

  computed: {
    ...mapGetters('projects', ['currentProject']),

    visibleCards() {
      const all = [
        {
          icon: mdiUploadOutline,
          title: this.$t('projectHome.importData'),
          description: this.$t('projectHome.importDataDesc'),
          link: `dataset/import`,
          adminOnly: true
        },
        {
          icon: mdiDatabaseOutline,
          title: this.$t('dataset.dataset'),
          description: this.$t('projectHome.datasetDesc'),
          link: `dataset`,
          adminOnly: false
        },
        {
          icon: mdiLabelOutline,
          title: this.$t('labels.labels'),
          description: this.$t('projectHome.labelsDesc'),
          link: `labels`,
          adminOnly: false,
          hidden: !this.currentProject.canDefineLabel
        },
        {
          icon: mdiBookOpenOutline,
          title: this.$t('guideline.guideline'),
          description: this.$t('projectHome.guidelineDesc'),
          link: `guideline`,
          adminOnly: false
        },
        {
          icon: mdiAccountMultipleOutline,
          title: this.$t('members.members'),
          description: this.$t('projectHome.membersDesc'),
          link: `members`,
          adminOnly: true
        },
        {
          icon: mdiChartBar,
          title: this.$t('statistics.statistics'),
          description: this.$t('projectHome.statisticsDesc'),
          link: `metrics`,
          adminOnly: true
        },
        {
          icon: mdiDownloadOutline,
          title: this.$t('projectHome.exportDataset'),
          description: this.$t('projectHome.exportDataDesc'),
          link: `dataset/export`,
          adminOnly: true
        },
        {
          icon: mdiCog,
          title: this.$t('settings.title'),
          description: this.$t('projectHome.settingsDesc'),
          link: `settings`,
          adminOnly: true
        }
      ]
      return all.filter((c) => !c.hidden && (this.isProjectAdmin || !c.adminOnly))
    }
  },

  async created() {
    const member = await this.$repositories.member.fetchMyRole(this.$route.params.id)
    this.isProjectAdmin = member.isProjectAdmin
  },

  methods: {
    navigate(link) {
      this.$router.push(this.localePath(`/projects/${this.$route.params.id}/${link}`))
    },

    toLabeling() {
      const query = this.$services.option.findOption(this.$route.params.id)
      const link = getLinkToAnnotationPage(this.$route.params.id, this.currentProject.projectType)
      this.$router.push({ path: this.localePath(link), query })
    }
  }
}
</script>

<style scoped>
.project-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}
.project-subtitle {
  font-size: 1rem;
  color: #64748b;
}
.action-card {
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  border-radius: 8px;
}
.action-card:hover {
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.15) !important;
  transform: translateY(-2px);
}
.card-desc {
  color: #64748b;
}
</style>
