/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Comment {
  id: string;
  username: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface AMV {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  animes: string[];
  tags: string[];
  musicTitle: string;
  musicArtist?: string;
  creator: string;
  creatorAvatar: string;
  likes: number;
  dislikes: number;
  views: number;
  duration: string;
  style: 'Sad' | 'Action' | 'Epic' | 'Romance' | 'Other';
  quality: '720p' | '1080p' | '4K';
  comments: Comment[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  username: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  isAdmin?: boolean;
}

export interface CurrentUser {
  id?: string;
  email?: string;
  username: string;
  avatar: string;
  role: 'user' | 'admin';
}
