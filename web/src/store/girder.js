import { girderRest, publishRest, loggedIn } from '@/rest';
import toggles from '@/featureToggle';

export default {
  namespaced: true,
  state: {
    browseLocation: null,
    selected: [],
  },
  getters: {
    loggedIn,
  },
  mutations: {
    setSelected(state, selected) {
      state.selected = selected;
    },
    setBrowseLocation(state, location) {
      state.browseLocation = location;
    },
  },
  actions: {
    async fetchFullLocation({ commit }, location) {
      if (location && location._id && location._modelType) {
        const { _id: id, _modelType: modelType } = location;

        const { status, data } = await girderRest.get(`${modelType}/${id}`);
        if (status === 200) {
          commit('setBrowseLocation', data);
        }
      }
    },
    async logout() {
      if (toggles.UNIFIED_API) {
        await publishRest.logout();
      } else {
        await girderRest.logout();
      }
    },
  },
};
