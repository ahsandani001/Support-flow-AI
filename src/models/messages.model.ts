import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  ticketId: string;
  content: string;
  sender: {
    type: 'customer' | 'agent' | 'system';
    // Optional details based on sender type
    customerEmail?: string; // If sender is customer
    agentId?: string; // If sender is agent
    agentName?: string; // If sender is agent
    systemEvent?: string; // If sender is system
  };
  channel: 'email' | 'chat' | 'system';
  attachments?: {
    filename: string;
    url: string;
    mimeType: string;
  }[];
  metadata?: {
    // Channel-specific data
    emailHeaders?: any; // For email: from, to, subject
    ipAddress?: string; // For chat: user's IP
    userAgent?: string; // For chat: browser info
  };
}

const messageSchema = new Schema<IMessage>(
  {
    ticketId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    sender: {
      type: {
        type: String,
        enum: ['customer', 'agent', 'system'],
        required: true,
      },
      customerEmail: String,
      agentId: String,
      agentName: String,
      systemEvent: String,
    },
    channel: { type: String, enum: ['email', 'chat', 'system'] },
    attachments: [
      {
        filename: String,
        url: String,
        mimeType: String,
      },
    ],
    metadata: {
      type: Schema.Types.Mixed, // Flexible for any channel metadata
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export const Message = mongoose.model<IMessage>('Message', messageSchema);
