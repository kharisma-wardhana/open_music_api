class CollaborationHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaboration.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaboration.bind(this);
  }

  async postCollaboration(req, h) {
    this._validator.validateCollaborationPayload(req.payload);
    const { id: credentialId } = req.auth.credentials;
    const { playlistId, userId } = req.payload;

    await this._playlistsService.verifyPlaylistUser(playlistId, credentialId);
    const collaborationId = await this._collaborationsService.addCollaboration(
      playlistId,
      userId
    );

    return h
      .response({
        status: 'success',
        message: 'Collaboration added successfully',
        data: {
          collaborationId,
        },
      })
      .code(201);
  }

  async deleteCollaboration(req, h) {
    this._validator.validateCollaborationPayload(req.payload);
    const { id: credentialId } = req.auth.credentials;
    const { playlistId, userId } = req.payload;

    await this._playlistsService.verifyPlaylistUser(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return h.response({
      status: 'success',
      message: 'Collaboration deleted successfully',
    });
  }
}

module.exports = CollaborationHandler;
