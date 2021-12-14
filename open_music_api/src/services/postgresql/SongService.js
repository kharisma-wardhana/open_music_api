const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const { detailSongMapper } = require('../../utils/mappers/DetailSongMapper');
const InvariantError = require('../../exceptions/InvariantError');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async getAllSong() {
    try {
      const cacheData = await this._cacheService.get(`songs:all`);
      return JSON.parse(cacheData);
    } catch {
      const query = 'SELECT id,title,performer FROM songs';
      const { rows } = await this._pool.query(query);
      if (!rows.length) {
        throw new NotFoundError('Empty songs');
      }
      await this._cacheService.set(`songs:all`, JSON.stringify(rows));
      return rows;
    }
  }

  async getSongById(id) {
    try {
      const cacheData = await this._cacheService.get(`songs:${id}`);
      return JSON.parse(cacheData);
    } catch {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [id],
      };
      const { rows } = await this._pool.query(query);
      if (!rows.length) {
        throw new NotFoundError(`Song with id ${id} not found`);
      }
      await this._cacheService.set(
        `songs:${id}`,
        JSON.stringify(rows.map(detailSongMapper))
      );
      return rows.map(detailSongMapper)[0];
    }
  }

  async createSong(song) {
    const insertedAt = new Date().toISOString();
    const id = `song-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO songs
      (id, title, performer, genre, duration, year, inserted_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      values: [
        id,
        song.title,
        song.performer,
        song.genre,
        song.duration,
        song.year,
        insertedAt,
      ],
    };
    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Song not created');
    }
    await this._cacheService.delete(`songs:${id}`);
    return rows[0].id;
  }

  async updateSong(id, song) {
    const query = {
      text: `UPDATE songs
      SET title = $1, performer = $2, genre = $3, year = $4, duration = $5 
      WHERE id = $6 RETURNING id`,
      values: [
        song.title,
        song.performer,
        song.genre,
        song.year,
        song.duration,
        id,
      ],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError(`Song with id ${id} not found`);
    }
    await this._cacheService.delete(`songs:${id}`);
    return rows[0].id;
  }

  async deleteSong(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError(`Song with id ${id} not found`);
    }
    await this._cacheService.delete(`songs:${id}`);
    return rowCount;
  }
}
module.exports = SongsService;
