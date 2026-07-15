export default function handler(request, response) {
  return response.status(200).json({ ok: true, message: 'Ball Kho Gayi XI API works.' });
}
