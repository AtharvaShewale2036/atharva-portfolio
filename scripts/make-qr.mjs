import QRCode from 'qrcode';

const url = process.argv[2];
if (!url?.startsWith('https://')) {
  console.error('Usage: npm run qr -- https://your-live-url');
  process.exit(1);
}
// Dark ink on cream: scanners need dark modules on a light background.
const opts = { errorCorrectionLevel: 'H', margin: 4, color: { dark: '#1c1b1fff', light: '#f1e8d4ff' } };
await QRCode.toFile('public/qr.svg', url, { ...opts, type: 'svg' });
await QRCode.toFile('public/qr.png', url, { ...opts, width: 1024 });
console.log(`QR for ${url} written to public/qr.svg and public/qr.png`);
