const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations (id, playlist_id, user_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new InvariantError('Collaboration failed to add');
    }

    return rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };
    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new InvariantError('Collaboration failed to delete');
    }
  }

  async verifyCollaboration(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new InvariantError('Collaboration does not exist');
    }
    const collabUserId = rows[0].user_id;
    if (collabUserId !== userId) {
      throw new AuthorizationError('Unauthorized access');
    }
  }
}

module.exports = CollaborationService;
