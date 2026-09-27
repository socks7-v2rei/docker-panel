// api/status.js
// بررسی وضعیت یه دیپلوی (در حال ساخت، آماده، خطا و ...)

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'فقط متد GET مجازه' });
    return;
  }

  const { token, id, teamId } = req.query;

  if (!token || !id) {
    res.status(400).json({ error: 'توکن و شناسه دیپلوی الزامی هستن' });
    return;
  }

  try {
    const apiUrl = new URL(`https://api.vercel.com/v13/deployments/${id}`);
    if (teamId) apiUrl.searchParams.set('teamId', teamId);

    const r = await fetch(apiUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await r.json();

    if (!r.ok) {
      res.status(r.status).json({ error: (data && data.error && data.error.message) || 'خطا در دریافت وضعیت' });
      return;
    }

    res.status(200).json({
      readyState: data.readyState,
      url: `https://${data.url}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'خطای ناشناخته' });
  }
};
