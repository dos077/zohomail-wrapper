import Authentication from './auth';

const defaultConfig = {
  clientId: null,
  redirectUri: null,
  storeAuth: false,
  logInRedirect: false,
  scope: [
    'ZohoMail.Messages.CREATE',
    'ZohoMail.Messages.READ',
    'ZohoMail.Messages.UPDATE',
    'ZohoMail.Messages.DELETE'
  ],
};

export default ({
  clientId = defaultConfig.clientId,
  redirectUri = defaultConfig.redirectUri,
  storeAuth = defaultConfig.storeAuth,
  logInRedirect = defaultConfig.logInRedirect,
  scope = defaultConfig.scope,
  afterLogIn,
  afterLogOut,
}) => {
  if (!clientId) throw Error('client ID required');
  const config = {
    clientId,
    redirectUri,
    storeAuth,
    logInRedirect,
    scope,
    afterLogIn,
    afterLogOut,
  };
  const authentication = Authentication(config);
  return {
    authentication,
  };
};
