// Vercel Serverless Function - GET /api/teachers

const NOTION_API_KEY = process.env.NOTION_API_KEY?.trim();
const TEACHERS_DB_ID = process.env.TEACHERS_DB_ID?.trim();

const notionHeaders = {
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

function getPlainText(richTextArray) {
  if (!richTextArray || richTextArray.length === 0) return '';
  return richTextArray.map(rt => rt.plain_text).join('');
}

function getTitleText(titleArray) {
  if (!titleArray || titleArray.length === 0) return '';
  return titleArray.map(t => t.plain_text).join('');
}

export default async function handler(req, res) {
  // Set CORS headers
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
      const response = await fetch(`https://api.notion.com/v1/databases/${TEACHERS_DB_ID}/query`, {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify({
          filter: {
            property: 'Status',
            select: { equals: 'Active' }
          },
          sorts: [{ property: 'Full Name', direction: 'ascending' }],
          start_cursor: startCursor,
        }),
      });

      const data = await response.json();
      allResults = allResults.concat(data.results || []);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    const teachers = allResults.map(page => ({
      id: page.id,
      name: getTitleText(page.properties['Full Name']?.title),
      firstName: getPlainText(page.properties['First Name']?.rich_text),
      lastName: getPlainText(page.properties['Last Name']?.rich_text),
      nickname: getPlainText(page.properties['Nickname']?.rich_text),
      role: 'teacher',
    })).filter(t => t.name);

    teachers.sort((a, b) => {
      const firstA = (a.firstName || a.name).toLowerCase();
      const firstB = (b.firstName || b.name).toLowerCase();
      if (firstA !== firstB) return firstA.localeCompare(firstB);
      const lastA = (a.lastName || '').toLowerCase();
      const lastB = (b.lastName || '').toLowerCase();
      return lastA.localeCompare(lastB);
    });

    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
}
