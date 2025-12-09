// Vercel Serverless Function - GET /api/subjects

const NOTION_API_KEY = process.env.NOTION_API_KEY?.trim();
const SUBJECTS_DB_ID = process.env.SUBJECTS_DB_ID?.trim();

const notionHeaders = {
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

function getTitleText(titleArray) {
  if (!titleArray || titleArray.length === 0) return '';
  return titleArray.map(t => t.plain_text).join('');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let allResults = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response = await fetch(`https://api.notion.com/v1/databases/${SUBJECTS_DB_ID}/query`, {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify({
          start_cursor: startCursor,
        }),
      });

      const data = await response.json();
      allResults = allResults.concat(data.results || []);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    const subjectSet = new Set();
    allResults.forEach(page => {
      let title = getTitleText(page.properties['Name']?.title) ||
                  getTitleText(Object.values(page.properties).find(p => p.type === 'title')?.title);
      if (title) {
        title = title.replace(/\s+/g, ' ').trim();
        if (title) {
          subjectSet.add(title);
        }
      }
    });

    const subjects = Array.from(subjectSet).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
}
