require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const ClientError = require('./exceptions/ClientError');

// authentications
const authentications = require('./api/auth');
const AuthService = require('./services/postgresql/AuthService');
const AuthenticationsValidator = require('./validators/auth');
const TokenManager = require('./utils/tokenize/TokenManager');

// users
const users = require('./api/users');
const UserService = require('./services/postgresql/UserService');
const UserValidator = require('./validators/user');

// songs
const songs = require('./api/songs');
const SongService = require('./services/postgresql/SongService');
const SongValidator = require('./validators/song');

// playlists
const playlists = require('./api/playlists');
const PlaylistService = require('./services/postgresql/PlaylistService');
const PlaylistValidator = require('./validators/playlist');

// playlistsongs
const playlistsongs = require('./api/playlistsongs');
const PlaylistSongService = require('./services/postgresql/PlaylistSongService');
const PlaylistSongValidator = require('./validators/playlistsong');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationService = require('./services/postgresql/CollaborationService');
const CollaborationValidator = require('./validators/collaboration');

// exports
const songexports = require('./api/exports');
const SendMessageService = require('./services/rabbitmq/SendMessageService');
const ExportValidator = require('./validators/export');

// Uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadValidator = require('./validators/upload');

// Cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
  const cacheService = new CacheService();
  const authService = new AuthService();
  const userService = new UserService();
  const songsService = new SongService(cacheService);
  const playlistSongService = new PlaylistSongService(cacheService);
  const collaborationService = new CollaborationService(cacheService);
  const playlistService = new PlaylistService(collaborationService);

  const uploadedFolder = path.resolve(__dirname, 'api/uploads/file/images');
  const storageService = new StorageService(uploadedFolder);

  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: authentications,
      options: {
        authService,
        userService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UserValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: playlistsongs,
      options: {
        playlistService,
        playlistSongService,
        collaborationService,
        validator: PlaylistSongValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationService,
        playlistService,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: songexports,
      options: {
        service: SendMessageService,
        playlistService,
        playlistSongService,
        validator: ExportValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
    return response.continue || response;
  });

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();
