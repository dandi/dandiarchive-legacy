import { RestClient } from '@girder/components/src';
import toggles from '@/featureToggle';
import publishRest from '@/publishRest';

// Ensure doesn't contain trailing slash
const apiRoot = process.env.VUE_APP_API_ROOT.endsWith('/')
  ? process.env.VUE_APP_API_ROOT.slice(0, -1)
  : process.env.VUE_APP_API_ROOT;

const girderRest = new RestClient({ apiRoot, setLocalCookie: true });

const loggedIn = () => ((toggles.UNIFIED_API) ? !!publishRest.user : !!girderRest.user);
const user = () => ((toggles.UNIFIED_API) ? publishRest.user : girderRest.user);

export {
  girderRest,
  publishRest,
  loggedIn,
  user,
};
