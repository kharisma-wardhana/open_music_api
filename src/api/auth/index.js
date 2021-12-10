const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (
    server,
    { authService, userService, tokenManager, validator }
  ) => {
    const authHandler = new AuthenticationsHandler(
      authService,
      userService,
      tokenManager,
      validator
    );
    server.route(routes(authHandler));
  },
};
