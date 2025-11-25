const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>短链接生成器</title>
    <meta name="description" content="短链接生成您提供短网址在线生成，短链接生成，支持连接缩短，免费提供API接口。" />
    <meta name="keywords" content="短网址,短网址生成,短链接,短链接生成,短链接生成器,短网址转换,网址缩短,短地址,缩短网址,长链接转短链接" />
    <style>
        :root { 
            --bg-color: #ffffff; 
            --container-bg: #ffffff; 
            --input-bg: #f1f5f9; 
            --border-color: #cbd5e1; 
            --text-color: #0f172a; 
            --subtle-text: #64748b; 
            --accent-color: #3b82f6; 
            --accent-hover: #2563eb; 
            --error-color: #ef4444; 
            --success-color: #22c55e; 
        }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            background-color: var(--bg-color); 
            color: var(--text-color); 
            margin: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            padding: 1rem; 
            box-sizing: border-box; 
        }
        .container { 
            width: 100%; 
            max-width: 600px; 
            background-color: var(--container-bg); 
            border-radius: 0.25rem; 
            padding: 1.5rem; 
            border: 1px solid var(--border-color);
        }
        h1 { 
            text-align: center; 
            margin-bottom: 1.5rem; 
            font-size: 1.5rem; 
            font-weight: normal; 
        }
        form { 
            background-color: var(--input-bg); 
            padding: 1rem; 
            margin-bottom: 1rem; 
        }
        .form-main { 
            display: flex; 
            gap: 0.5rem; 
        }
        #url-input { 
            flex-grow: 1; 
            padding: 0.75rem 1rem; 
            background-color: var(--bg-color); 
            border: 1px solid var(--border-color); 
            border-radius: 0.125rem; 
            color: var(--text-color); 
            font-size: 1rem; 
        }
        #url-input:focus { 
            outline: none; 
            border-color: var(--accent-color); 
        }
        .advanced-options { 
            margin-top: 1rem; 
        }
        .advanced-options label { 
            display: flex; 
            align-items: center; 
            gap: 0.5rem; 
            color: var(--subtle-text); 
            font-size: 0.875rem; 
        }
        #slug-input { 
            padding: 0.5rem; 
            background-color: var(--bg-color); 
            border: 1px solid var(--border-color); 
            border-radius: 0.125rem; 
            color: var(--text-color); 
            font-size: 0.875rem; 
        }
        button { 
            padding: 0.75rem 1.5rem; 
            background-color: var(--accent-color); 
            color: #ffffff; 
            border: none; 
            border-radius: 0.125rem; 
            font-weight: normal; 
            font-size: 1rem; 
            cursor: pointer; 
        }
        button:hover { 
            background-color: var(--accent-hover); 
        }
        button:disabled { 
            background-color: #94a3b8; 
            cursor: not-allowed; 
        }
        #error-message, #success-message { 
            text-align: center; 
            margin-bottom: 1rem; 
            padding: 0.75rem; 
            border-radius: 0.125rem; 
            display: none; 
        }
        #error-message { 
            color: var(--error-color); 
            background-color: #fee2e2; 
            border: 1px solid var(--error-color);
        }
        #success-message { 
            color: var(--success-color); 
            background-color: #dcfce7; 
            border: 1px solid var(--success-color);
        }
        #success-message a { 
            font-weight: normal; 
            color: var(--accent-color); 
            text-decoration: none; 
        }
        #success-message .copy-btn { 
            margin-left: 1rem; 
            background-color: var(--input-bg); 
            color: var(--text-color); 
            padding: 0.25rem 0.75rem; 
            font-size: 0.8rem; 
            border-radius: 0.125rem; 
            border: 1px solid var(--border-color); 
            cursor: pointer; 
        }
        #success-message .copy-btn:hover { 
            background-color: var(--border-color); 
        }
    </style>
</head>
<body>
<div class="container">
    <h1>短链接生成器</h1>
    <form id="link-form">
        <div class="form-main">
            <input type="url" id="url-input" placeholder="请输入长链接" required>
            <button type="submit" id="submit-btn">生成</button>
        </div>
        <div class="advanced-options">
            <label>
                自定义短链接 (可选):
                <input type="text" id="slug-input" placeholder="例如: my-link">
            </label>
        </div>
    </form>
    <div id="error-message"></div>
    <div id="success-message"></div>
</div>
<script>
    const form = document.getElementById('link-form');
    const urlInput = document.getElementById('url-input');
    const slugInput = document.getElementById('slug-input');
    const submitBtn = document.getElementById('submit-btn');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    async function createLink(e) {
        e.preventDefault();
        const originalUrl = urlInput.value;
        if (!originalUrl) return;

        const customSlug = slugInput.value.trim();
        setLoading(true);
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        try {
            const payload = { url: originalUrl };
            if (customSlug) {
                payload.slug = customSlug;
            }
            const res = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error || '创建链接失败。');
            }
            const newLink = await res.json();
            urlInput.value = '';
            slugInput.value = '';
            showSuccess(newLink);
        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function showSuccess(newLink) {
        const shortUrl = \`\${window.location.origin}/\${newLink.slug}\`;
        successMessage.innerHTML = \`
            <span>成功！链接为: <a href="\${shortUrl}" target="_blank">\${shortUrl.replace(/^https?:\\/\\//, '')}</a></span>
            <button class="copy-btn" data-url="\${shortUrl}">复制</button>
        \`;
        successMessage.style.display = 'block';
    }

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? '生成中...' : '生成';
    }

    function showError(message) {
        errorMessage.textContent =  message;
        errorMessage.style.display = 'block';
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-btn')) {
            navigator.clipboard.writeText(e.target.dataset.url).then(() => {
                e.target.textContent = '已复制!';
                setTimeout(() => { e.target.textContent = '复制'; }, 1500);
            });
        }
    });

    form.addEventListener('submit', createLink);
</script>
</body>
</html>
`;

const adminHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理后台 - 短链接</title>
    <style>
        :root { 
            --bg-color: #ffffff; 
            --container-bg: #ffffff; 
            --border-color: #cbd5e1; 
            --text-color: #0f172a; 
            --error-color: #ef4444; 
            --accent-color: #3b82f6; 
        }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            background-color: var(--bg-color); 
            color: var(--text-color); 
            margin: 0; 
            padding: 1rem; 
        }
        .container { 
            width: 100%; 
            max-width: 900px; 
            margin: auto; 
            background-color: var(--container-bg); 
            padding: 1.5rem; 
            border: 1px solid var(--border-color);
        }
        h1 { 
            text-align: center; 
            margin-top: 0; 
            font-weight: normal; 
            font-size: 1.5rem; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        th, td { 
            padding: 0.75rem 1rem; 
            text-align: left; 
            border-bottom: 1px solid var(--border-color); 
        }
        .delete-btn { 
            background-color: var(--error-color); 
            color: #ffffff; 
            border: none; 
            padding: 0.25rem 0.75rem; 
            border-radius: 0.125rem; 
            cursor: pointer; 
        }
        .delete-btn:hover { 
            background-color: #dc2626; 
        }
        a { 
            color: var(--accent-color); 
            text-decoration: none; 
        }
        a:hover { 
            text-decoration: underline; 
        }
    </style>
</head>
<body>
<div class="container">
    <h1>管理后台</h1>
    <p>链接总数: <span id="link-count">0</span></p>
    <table>
        <thead>
            <tr>
                <th>短链接</th>
                <th>原始链接</th>
                <th>访问次数</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody id="links-table-body"></tbody>
    </table>
</div>
<script>
    const linksTableBody = document.getElementById('links-table-body');
    const linkCount = document.getElementById('link-count');
    const adminSlug = window.location.pathname.split('/').pop();

    const authHeaders = {
        'Content-Type': 'application/json',
        'X-Admin-Slug': adminSlug
    };

    async function getLinks() {
        try {
            const res = await fetch('/api/links', { headers: authHeaders });
            if (!res.ok) {
                if (res.status === 401) {
                  document.body.innerHTML = '<h1>未授权访问</h1>';
                }
                throw new Error('获取链接列表失败。');
            }
            const links = await res.json();
            linkCount.textContent = links.length;
            renderLinks(links);
        } catch(err) {
            console.error(err);
        }
    }

    function renderLinks(links) {
        linksTableBody.innerHTML = '';
        links.sort((a, b) => b.visits - a.visits);
        for (const link of links) {
            const shortUrl = \`\${window.location.origin}/\${link.slug}\`;
            const row = document.createElement('tr');
            row.dataset.slug = link.slug;
            row.innerHTML = \`
                <td><a href="\${shortUrl}" target="_blank">\${shortUrl.replace(/^https?:\\/\\//, '')}</a></td>
                <td><a href="\${link.original}" target="_blank" title="\${link.original}">\${link.original.substring(0, 50) + (link.original.length > 50 ? '...' : '')}</a></td>
                <td>\${link.visits}</td>
                                 <td><button class="delete-btn" data-slug="\${link.slug}">删除</button></td>
            \`;
            linksTableBody.appendChild(row);
        }
    }

    async function deleteLink(slug) {
        if (!confirm(\`您确定要删除短链接 "\${slug}" 吗？\`)) return;
        try {
            const res = await fetch('/api/delete', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ slug }),
            });
            if (!res.ok) throw new Error('删除失败。');
            document.querySelector(\`tr[data-slug="\${slug}"]\`).remove();
            linkCount.textContent = parseInt(linkCount.textContent) - 1;
        } catch (err) {
            alert(err.message);
        }
    }

    linksTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteLink(e.target.dataset.slug);
        }
    });

    getLinks();
</script>
</body>
</html>
`;

export async function onRequest({ request, params, env }) {
  const { slug } = params;
  const adminPath = env.ADMIN_PATH;

  // Serve admin panel only if the path is set and matches the slug
  if (adminPath && slug === adminPath) {
    return new Response(adminHtml, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  if (!slug || slug === 'favicon.ico') {
    return new Response(indexHtml, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  try {
    const link = await my_kv.get(slug);
    if (link) {
      const linkData = JSON.parse(link);
      linkData.visits = (linkData.visits || 0) + 1;
      await my_kv.put(slug, JSON.stringify(linkData));
      return Response.redirect(linkData.original, 302);
    }
  } catch (err) {
    console.error(`KV Error: ${err.message}`);
  }

  return new Response(indexHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    status: 404
  });
}