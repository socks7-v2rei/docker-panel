// api/deploy.js
// گرفتن نام ایمیج داکر از کاربر و ساخت یه دیپلوی جدید روی Vercel
// با استفاده از توکن API خود کاربر.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'فقط متد POST مجازه' });
    return;
  }

  try {
    const { token, projectName, image, teamId, port } = req.body || {};

    if (!token || !projectName || !image) {
      res.status(400).json({ error: 'توکن، نام پروژه و ایمیج داکر الزامی هستن' });
      return;
    }

    // اعتبارسنجی ساده‌ی نام پروژه (فقط حروف کوچک، عدد، خط تیره)
    const safeName = String(projectName).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const dockerfileLines = [`FROM ${image}`];
    if (port) {
      dockerfileLines.push(`ENV PORT=${port}`);
    }
    const dockerfile = dockerfileLines.join('\n') + '\n';

    const apiUrl = new URL('https://api.vercel.com/v13/deployments');
    apiUrl.searchParams.set('skipAutoDetectionConfirmation', '1');
    if (teamId) apiUrl.searchParams.set('teamId', teamId);

    const body = {
      name: safeName,
      target: 'production',
      files: [
        { file: 'Dockerfile.vercel', data: dockerfile }
      ]
    };

    const r = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await r.json();

    if (!r.ok) {
      res.status(r.status).json({
        error: (data && data.error && data.error.message) || 'خطا در ساخت دیپلوی',
        details: data
      });
      return;
    }

    res.status(200).json({
      id: data.id,
      url: `https://${data.url}`,
      inspectorUrl: data.inspectorUrl,
      readyState: data.readyState
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'خطای ناشناخته' });
  }
};
