const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyPlaylistUser(playlistId, userId) {
    const query = {
      text: 'SELECT user_id FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Playlist not found');
    }

    if (rows[0].userId !== userId) {
      throw new AuthorizationError('Unauthorized to access playlist');
    }
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username AS username 
      FROM playlists LEFT JOIN users ON playlists.user_id = users.id 
      WHERE playlists.user_id = $1`,
      values: [userId],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('User does not have playlists');
    }
    return rows;
  }

  async getPlaylist(id) {
    const query = {
      text: 'SELECT id,user_id,name FROM playlists WHERE id = $1',
      values: [id],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Playlist not found');
    }
    return rows[0];
  }

  async createPlaylist(playlist) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists (id, user_id, name) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlist.userId, playlist.name],
    };
    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Playlist not created');
    }
    return rows[0].id;
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Playlist not found');
    }
    return rowCount;
  }
}

module.exports = PlaylistService;
