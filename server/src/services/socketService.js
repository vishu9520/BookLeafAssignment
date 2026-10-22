let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    // console.log(`[Socket] Client connected: ${socket.id}`);

    // Author joins their own private channel
    socket.on('join:author', (authorId) => {
      if (authorId) {
        socket.join(`author:${authorId}`);
        // console.log(`[Socket] Socket ${socket.id} joined author:${authorId}`);
      }
    });

    // Admin joins the global admin channel for incoming ticket alerts
    socket.on('join:admin', () => {
      socket.join('admin:tickets');
      // console.log(`[Socket] Socket ${socket.id} joined admin:tickets`);
    });

    // Join specific ticket discussion room
    socket.on('join:ticket', (ticketId) => {
      if (ticketId) {
        socket.join(`ticket:${ticketId}`);
        // console.log(`[Socket] Socket ${socket.id} joined ticket:${ticketId}`);
      }
    });

    socket.on('leave:ticket', (ticketId) => {
      if (ticketId) {
        socket.leave(`ticket:${ticketId}`);
      }
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

function getIO() {
  return ioInstance;
}

function emitTicketCreated(ticket) {
  if (ioInstance) {
    ioInstance.to('admin:tickets').emit('ticket:created', ticket);
    if (ticket.author_id) {
      ioInstance.to(`author:${ticket.author_id}`).emit('ticket:created', ticket);
    }
  }
}

function emitTicketUpdated(ticket) {
  if (ioInstance) {
    ioInstance.to('admin:tickets').emit('ticket:updated', ticket);
    ioInstance.to(`ticket:${ticket._id}`).emit('ticket:updated', ticket);
    if (ticket.author_id) {
      ioInstance.to(`author:${ticket.author_id}`).emit('ticket:updated', ticket);
    }
  }
}

function emitResponseAdded(ticket, response) {
  if (ioInstance) {
    ioInstance.to(`ticket:${ticket._id}`).emit('ticket:response_added', { ticketId: ticket._id, ticket, response });
    ioInstance.to('admin:tickets').emit('ticket:updated', ticket);
    if (ticket.author_id) {
      ioInstance.to(`author:${ticket.author_id}`).emit('ticket:response_added', { ticketId: ticket._id, ticket, response });
    }
  }
}

function emitInternalNoteAdded(ticket, note) {
  if (ioInstance) {
    // Only emit internal notes to admin room
    ioInstance.to('admin:tickets').emit('ticket:note_added', { ticketId: ticket._id, ticket, note });
    ioInstance.to(`ticket:${ticket._id}`).emit('ticket:note_added', { ticketId: ticket._id, ticket, note });
  }
}

module.exports = {
  initSocket,
  getIO,
  emitTicketCreated,
  emitTicketUpdated,
  emitResponseAdded,
  emitInternalNoteAdded
};
