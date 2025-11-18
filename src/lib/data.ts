
import type { Song } from "./types";
import { PlaceHolderImages } from './placeholder-images';

export const LISTENING_HISTORY: string = JSON.stringify([
  { "title": "Blinding Lights", "artist": "The Weeknd", "timestamp": "2024-05-01T10:00:00Z" },
  { "title": "Levitating", "artist": "Dua Lipa", "timestamp": "2024-05-01T10:04:00Z" },
  { "title": "Save Your Tears", "artist": "The Weeknd", "timestamp": "2024-05-01T10:08:00Z" },
  { "title": "good 4 u", "artist": "Olivia Rodrigo", "timestamp": "2024-05-01T10:12:00Z" },
  { "title": "Stay", "artist": "The Kid LAROI, Justin Bieber", "timestamp": "2024-05-01T10:15:00Z" },
  { "title": "INDUSTRY BABY", "artist": "Lil Nas X, Jack Harlow", "timestamp": "2024-05-02T11:00:00Z" },
  { "title": "Heat Waves", "artist": "Glass Animals", "timestamp": "2024-05-02T11:04:00Z" },
  { "title": "As It Was", "artist": "Harry Styles", "timestamp": "2024-05-02T11:08:00Z" },
  { "title": "Shivers", "artist": "Ed Sheeran", "timestamp": "2024-05-03T12:00:00Z" },
  { "title": "Bohemian Rhapsody", "artist": "Queen", "timestamp": "2024-05-03T12:05:00Z" },
  { "title": "Hotel California", "artist": "Eagles", "timestamp": "2024-05-03T12:11:00Z" },
  { "title": "Smells Like Teen Spirit", "artist": "Nirvana", "timestamp": "2024-05-04T13:00:00Z" },
  { "title": "Billie Jean", "artist": "Michael Jackson", "timestamp": "2024-05-04T13:05:00Z" },
  { "title": "Like a Rolling Stone", "artist": "Bob Dylan", "timestamp": "2024-05-04T13:10:00Z" },
  { "title": "Stairway to Heaven", "artist": "Led Zeppelin", "timestamp": "2024-05-04T13:16:00Z" },
  { "title": "Get Lucky", "artist": "Daft Punk", "timestamp": "2024-05-05T14:00:00Z" },
  { "title": "Uptown Funk", "artist": "Mark Ronson, Bruno Mars", "timestamp": "2024-05-05T14:06:00Z" },
  { "title": "Rolling in the Deep", "artist": "Adele", "timestamp": "2024-05-05T14:10:00Z" },
  { "title": "bad guy", "artist": "Billie Eilish", "timestamp": "2024-05-05T14:14:00Z" }
]);

const songData = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200 },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203 },
  { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', duration: 215 },
  { id: '4', title: 'good 4 u', artist: 'Olivia Rodrigo', album: 'SOUR', duration: 178 },
  { id: '5', title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', album: 'F*CK LOVE 3: OVER YOU', duration: 141 },
  { id: '6', title: 'INDUSTRY BABY', artist: 'Lil Nas X, Jack Harlow', album: 'MONTERO', duration: 212 },
  { id: '7', title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration: 238 },
  { id: '8', title: 'As It Was', artist: 'Harry Styles', album: 'Harry\'s House', duration: 167 },
  { id: '9', title: 'Shivers', artist: 'Ed Sheeran', album: '=', duration: 207 },
  { id: '10', title: 'bad guy', artist: 'Billie Eilish', album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?', duration: 194 },
  { id: '11', title: 'Uptown Funk', artist: 'Mark Ronson, Bruno Mars', album: 'Uptown Special', duration: 270 },
  { id: '12', title: 'Get Lucky', artist: 'Daft Punk', album: 'Random Access Memories', duration: 369 },
  { id: '13', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: 355 },
  { id: '14', title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', duration: 391 },
  { id: '15', title: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', duration: 301 },
  { id: '16', title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', duration: 294 },
  { id: '17', title: 'Like a Rolling Stone', artist: 'Bob Dylan', album: 'Highway 61 Revisited', duration: 369 },
  { id: '18', title: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', duration: 482 },
  { id: '19', title: 'Rolling in the Deep', artist: 'Adele', album: '21', duration: 228 },
  { id: '20', title: 'Wonderwall', artist: 'Oasis', album: '(What\'s the Story) Morning Glory?', duration: 258 },
];

export const SONGS: Song[] = songData.map((song, index) => {
  const placeholder = PlaceHolderImages[index % PlaceHolderImages.length];
  return {
    ...song,
    albumArtUrl: placeholder.imageUrl,
    imageHint: placeholder.imageHint,
  };
});
