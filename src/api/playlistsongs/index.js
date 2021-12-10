const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistsongs',
  version: '1.0.0',
  register: async (
    server,
    { playlistService, playlistSongService, validator }
  ) => {
    const playlistSongHandler = new PlaylistSongsHandler(
      playlistService,
      playlistSongService,
      validator
    );
    server.route(routes(playlistSongHandler));
  },
};
