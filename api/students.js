// Vercel Serverless Function - GET /api/students

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const STUDENTS_DB_ID = process.env.STUDENTS_DB_ID;

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
      const response = await fetch(`https://api.notion.com/v1/databases/${STUDENTS_DB_ID}/query`, {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify({
          filter: {
            property: 'Status',
            select: { equals: 'Active' }
          },
          start_cursor: startCursor,
        }),
      });

      const data = await response.json();
      allResults = allResults.concat(data.results || []);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    const students = allResults.map(page => ({
      id: page.id,
      name: getTitleText(page.properties['Full Name']?.title),
      englishName: getPlainText(page.properties['English Name']?.rich_text),
      koreanName: getPlainText(page.properties['Korean Name']?.rich_text),
      grade: getPlainText(page.properties['Grade']?.rich_text),
    })).filter(s => s.name);

    students.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
}
