export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-2xl font-semibold">Device tidak ditemukan</p>
        <p className="text-sm text-zinc-500">
          Periksa kembali ID device di dashboard admin.
        </p>
      </div>
    </div>
  );
}