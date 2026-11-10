export type Device = {
  id: string;
  nama: string;
  lokasi: string | null;
  status: 'online' | 'offline';
  last_seen: string | null;
  created_at: string;
};

export type Content = {
  id: string;
  judul: string;
  tipe: 'image' | 'video' | 'text' | 'url';
  payload: string;
  created_at: string;
};

export type ContentTipe = Content['tipe'];