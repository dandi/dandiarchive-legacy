import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    apiKey: null,
    girderRest: null,
    browseLocation: null,
    selected: [],
    // purposelly set it to 400, probably not a good practice
    currentStatus: 400,
  },
  getters: {
    loggedIn: state => !!state.girderRest.user,
    user: state => state.girderRest.user,
  },
  mutations: {
    setApiKey(state, apiKey) {
      state.apiKey = apiKey;
    },
    setBrowseLocation(state, location) {
      state.browseLocation = location;
    },
    setGirderRest(state, gr) {
      state.girderRest = gr;
    },
    setSelected(state, selected) {
      state.selected = selected;
    },
    setStatus(state, currentStatus) {
      state.currentStatus = currentStatus;
    },
  },
  actions: {
    async fetchApiKey({ state, commit, getters }) {
      const { user } = getters;
      const { status, data } = await state.girderRest.get(
        'api_key', {
          params: {
            userId: user._id,
            // for testing check status purpose
            // userId: 'dsfdsfsdf',
            limit: 50,
            sort: 'name',
            sortdir: 1,
          },
        },
      );

      const [dandiKey] = data.filter(key => key.name === 'dandicli');
      commit('setStatus', status);
      if (status === 200 && dandiKey) {
        // if there is an existing api key
        // send the key id to "PUT" endpoint for updating
        const { data: { key } } = await state.girderRest.put(`api_key/${dandiKey._id}`);
        commit('setApiKey', key);
      } else {
        // create a key using "POST" endpoint
        const { status: createStatus, data: { key } } = await state.girderRest.post('api_key', null, {
          params: {
            name: 'dandicli',
            scope: JSON.stringify(['core.data.read', 'core.data.write']),
            tokenDuration: 30,
            active: true,
          },
        });

        if (createStatus === 200) {
          commit('setApiKey', key);
        } else {
          commit('setStatus', status);
        }
      }
    },
    async fetchFullLocation({ state, commit }, location) {
      if (location && location._id && location._modelType) {
        const { _id: id, _modelType: modelType } = location;
        const resp = await state.girderRest.get(`${modelType}/${id}`);

        if (resp.status === 200) {
          commit('setBrowseLocation', resp.data);
        }
      }
    },
    async selectSearchResult({ state, commit }, result) {
      commit('setSelected', []);

      if (result._modelType === 'item') {
        const resp = await state.girderRest.get(`folder/${result.folderId}`);
        commit('setBrowseLocation', resp.data);
        // Because setting the location is going to trigger the DataBrowser to
        // set its selected value to [], which due to two-way binding also propagates back
        // up to this component, we must defer this to the next tick so that this runs after that,
        // as we have no way to update the DataBrowser location without having it also reset the
        // selection internally.
        Vue.nextTick(() => { commit('setSelected', [result]); });
      } else {
        commit('setBrowseLocation', result);
      }
    },
    async logout({ state }) {
      await state.girderRest.logout();
    },
  },
});
