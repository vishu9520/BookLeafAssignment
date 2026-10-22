const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'BookLeaf Publishing - Author Support & Communication Portal API',
    version: '1.0.0',
    description: 'REST API powering the Author Support & Communication Portal with AI-assisted classification, priority scoring, and draft response generation.',
    contact: {
      name: 'BookLeaf Engineering Team',
      email: 'tech@bookleafpub.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT Access Token (prefix with Bearer)'
      }
    }
  },
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in as Author or Admin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'priya.sharma@email.com' },
                  password: { type: 'string', example: 'author123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful, returns user object, accessToken, refreshToken' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh Access Token using Refresh Token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Returns new accessToken and rotated refreshToken' },
          401: { description: 'Invalid or expired refresh token' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user object' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/books/my-books': {
      get: {
        tags: ['Books'],
        summary: 'Get books published by logged-in author',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of author books and aggregated royalty stats' },
          403: { description: 'Forbidden (Authors only)' }
        }
      }
    },
    '/api/tickets': {
      post: {
        tags: ['Tickets'],
        summary: 'Submit a new support ticket (Author)',
        description: 'Automatically triggers AI auto-classification, priority scoring, and drafting using BookLeaf Knowledge Base.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['subject', 'description'],
                properties: {
                  book_id: { type: 'string', example: 'BK001' },
                  subject: { type: 'string', example: 'Discrepancy in my Q3 royalty payout' },
                  description: { type: 'string', example: 'I sold 342 copies of Whispers of the Ganges but only received 8400.' },
                  attachments: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Ticket created and AI draft synthesized' }
        }
      },
      get: {
        tags: ['Tickets'],
        summary: 'Get all tickets with filters and queue metrics (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['all', 'Open', 'In Progress', 'Resolved', 'Closed'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['all', 'Critical', 'High', 'Medium', 'Low'] } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['urgent', 'oldest_unresolved', 'newest'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Filtered ticket queue and summary metrics' }
        }
      }
    },
    '/api/tickets/my-tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'Get all tickets submitted by logged-in author',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Author tickets list' }
        }
      }
    },
    '/api/tickets/{id}': {
      get: {
        tags: ['Tickets'],
        summary: 'Get ticket details and conversation thread',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Ticket data' },
          403: { description: 'Forbidden if author does not own ticket' }
        }
      }
    },
    '/api/tickets/{id}/responses': {
      post: {
        tags: ['Tickets'],
        summary: 'Post response to ticket (Author or Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string' },
                  was_ai_draft: { type: 'boolean' },
                  update_status_to: { type: 'string', enum: ['Open', 'In Progress', 'Resolved', 'Closed'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Response added and broadcast in real-time' }
        }
      }
    },
    '/api/tickets/{id}/internal-notes': {
      post: {
        tags: ['Tickets'],
        summary: 'Add internal note (Admin only, never visible to author)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['note'],
                properties: {
                  note: { type: 'string', example: 'Bank branch verified; awaiting finance approval.' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Internal note saved' }
        }
      }
    },
    '/api/tickets/{id}/override': {
      patch: {
        tags: ['Tickets'],
        summary: 'Override AI category and/or priority (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  priority: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Classification overridden' }
        }
      }
    },
    '/api/tickets/{id}/status': {
      patch: {
        tags: ['Tickets'],
        summary: 'Update ticket status (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['Open', 'In Progress', 'Resolved', 'Closed'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Ticket status updated' }
        }
      }
    }
  }
};

module.exports = {
  swaggerUi,
  swaggerDocument
};
