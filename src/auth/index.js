import postAccessToken from './postAccessToken';
import revokeTokens from './revokeTokens';

export default (config) => {
  const state = {
    oAuthCode: null,
    accessToken: null,
    accessExpire: null,
    refreshToken: null,
    refreshExpire: null,
  };

  const isAccessValid = () =>
    state.accessToken && state.accessExpire - new Date() > 1000;
  const isRefreshValid = () =>
    state.refreshToken && state.refreshExpire - new Date() > 1000;

  const saveLocalToken = () => {
    window.localStorage.rrToken = state.refreshToken;
    window.localStorage.rrExpire = state.refreshExpire;
  };

  const loadLocalToken = () => {
    if (!state.refreshToken) {
      state.refreshToken = window.localStorage.rrToken;
      state.refreshExpire = new Date(window.localStorage.rrExpire);
    }
  };

  if (config.storeAuth) loadLocalToken();

  const getAccessToken = async () => {
    if (!state.refreshToken && config.storeAuth) loadLocalToken();
    if (!state.oAuthCode && !isRefreshValid())
      throw Error('no oAuth Code or valid refresh token');
    if (isAccessValid()) return state.accessToken;
    try {
      const authRes = await postAccessToken({ ...state, ...config });
      const {
        access_token,
        refresh_token,
        expires_in,
      } = authRes;
      state.accessToken = access_token;
      state.accessExpire = new Date(Date.now() + expires_in);
      if (state.oAuthCode) {
        state.refreshToken = refresh_token;
        state.refreshExpire = new Date(
          Date.now() + 31536000 * 1000
        );
      }
    } catch (e) {
      if (state.refreshToken) {
        state.refreshToken = null;
        if (config.storeAuth) saveLocalToken();
      }
      throw e;
    }
    state.oAuthCode = null;
    if (config.storeAuth) saveLocalToken();
    return state.accessToken;
  };

  const logIn = async (code) => {
    if (code) state.oAuthCode = code;
    else if (!isRefreshValid() && config.logInRedirect) {
      const url = new URL('https://accounts.zoho.com/oauth/v2/auth ');
      url.searchParams.append('response_type', 'code');
      url.searchParams.append('redirect_uri', config.redirectUri);
      url.searchParams.append('client_id', config.clientId);
      if (config.scope)
        url.searchParams.append('scope', config.scope.join(','));
      location.href = url.toString();
    }
    await getAccessToken();
    if (config.afterLogIn) config.afterLogIn();
  };

  const logOut = async () => {
    await revokeTokens({ ...state, ...config });
    state.refreshToken = null;
    state.accessToken = null;
    if (config.storeAuth) saveLocalToken();
    if (config.afterLogOut) config.afterLogOut();
  };

  return { getAccessToken, logIn, logOut };
};