import { girderRest, publishRest } from '@/rest';
import toggles from '@/featureToggle';

export default {
  namespaced: true,
  state: {
    drafts: 0,
    published: 0,
    users: 0,
    species: 0,
    subjects: 0,
    cells: 0,
    size: 0,
  },
  mutations: {
    setStats(state, { stats }) {
      state.drafts = stats.draft_count;
      state.published = stats.published_count;
      state.users = stats.user_count;
      state.species = stats.species_count;
      state.subjects = stats.subject_count;
      state.cells = stats.cell_count;
      state.size = stats.size;
    },
  },
  actions: {
    async reload({ commit }) {
      const { data } = await ((toggles.UNIFIED_API) ? publishRest.get('api/stats/') : girderRest.get('dandi/stats'));
      commit('setStats', { stats: data });
    },
  },
};
