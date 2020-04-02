import filesize from 'filesize';

import girderRest from '@/rest';

export default {
  namespaced: true,
  state: {
    drafts: 0,
    published: 0,
    users: 0,
    species: 0,
    subjects: 0,
    cells: 0,
    size: '0b',
  },
  mutations: {
    setStats(state, stats) {
      state.drafts = stats.draft_count;
      state.published = stats.published_count;
      state.users = stats.user_count;
      state.species = stats.species_count;
      state.subjects = stats.subject_count;
      state.cells = stats.cell_count;
      state.size = filesize(stats.size, { round: 0 });
    },
  },
  actions: {
    async reload({ commit }) {
      const { data } = await girderRest.get('dandi/stats');
      commit('setStats', data);
    },
  },
};
