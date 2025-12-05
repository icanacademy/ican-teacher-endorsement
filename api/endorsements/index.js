// Vercel Serverless Function - GET/POST /api/endorsements

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const ENDORSEMENT_DB_ID = process.env.ENDORSEMENT_DB_ID;

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

const TIME_SLOT_REVERSE_MAP = {
  '8AM-10AM': '8-10',
  '10AM-12PM': '10-12',
  '1PM-3PM': '1-3',
  '3PM-5PM': '3-5',
  '5PM-7PM': '5-7',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req, res) {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${ENDORSEMENT_DB_ID}/query`, {
      method: 'POST',
      headers: notionHeaders,
      body: JSON.stringify({
        sorts: [
          { property: 'Date', direction: 'descending' },
          { property: 'Created', direction: 'descending' }
        ]
      }),
    });

    const data = await response.json();

    const endorsements = data.results.map(page => {
      let timeSlot = '';
      if (page.properties['Time Slot']?.select?.name) {
        timeSlot = TIME_SLOT_REVERSE_MAP[page.properties['Time Slot'].select.name] || page.properties['Time Slot'].select.name;
      } else if (page.properties['Time Slot']?.rich_text) {
        timeSlot = getPlainText(page.properties['Time Slot'].rich_text);
      }

      let timeFrom = '';
      let timeTo = '';
      if (timeSlot && timeSlot.includes('-')) {
        const parts = timeSlot.split('-');
        if (parts.length === 2) {
          timeFrom = parts[0].trim();
          timeTo = parts[1].trim();
        }
      }

      return {
        id: page.id,
        notionId: page.id,
        studentName: getTitleText(page.properties['Student Name']?.title),
        date: page.properties['Date']?.date?.start || '',
        timeSlot,
        timeFrom,
        timeTo,
        classType: page.properties['Class Type']?.select?.name || getPlainText(page.properties['Class Type']?.rich_text) || '',
        bookMaterial: getPlainText(page.properties['Book/Material']?.rich_text),
        lastLesson: getPlainText(page.properties['Last Lesson']?.rich_text),
        aiSummary: getPlainText(page.properties['AI Summary']?.rich_text),
        nextLesson: getPlainText(page.properties['Next Lesson']?.rich_text),
        homework: getPlainText(page.properties['Homework']?.rich_text),
        notes: getPlainText(page.properties['Notes']?.rich_text),
        absentTeacherName: getPlainText(page.properties['Absent Teacher']?.rich_text),
        finalized: page.properties['Status']?.select?.name === 'Finalized',
        createdAt: page.created_time,
        updatedAt: page.last_edited_time,
      };
    });

    res.json(endorsements);
  } catch (error) {
    console.error('Error fetching endorsements:', error);
    res.status(500).json({ error: 'Failed to fetch endorsements' });
  }
}

async function handlePost(req, res) {
  try {
    const endorsement = req.body;

    const properties = {
      'Student Name': {
        title: [{ text: { content: endorsement.studentName || '' } }]
      },
      'Date': {
        date: endorsement.date ? { start: endorsement.date } : null
      },
      'Time Slot': {
        rich_text: [{ text: { content: endorsement.timeSlot || '' } }]
      },
      'Book/Material': {
        rich_text: [{ text: { content: endorsement.bookMaterial || '' } }]
      },
      'Last Lesson': {
        rich_text: [{ text: { content: endorsement.lastLesson || '' } }]
      },
      'AI Summary': {
        rich_text: [{ text: { content: (endorsement.aiSummary || '').substring(0, 2000) } }]
      },
      'Next Lesson': {
        rich_text: [{ text: { content: endorsement.nextLesson || '' } }]
      },
      'Homework': {
        rich_text: [{ text: { content: endorsement.homework || '' } }]
      },
      'Notes': {
        rich_text: [{ text: { content: endorsement.notes || '' } }]
      },
      'Absent Teacher': {
        rich_text: [{ text: { content: endorsement.absentTeacherName || '' } }]
      },
      'Status': {
        select: { name: endorsement.finalized ? 'Finalized' : 'Draft' }
      },
    };

    if (endorsement.classType) {
      properties['Class Type'] = {
        select: { name: endorsement.classType }
      };
    }

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: notionHeaders,
      body: JSON.stringify({
        parent: { database_id: ENDORSEMENT_DB_ID },
        properties,
      }),
    });

    const data = await response.json();

    if (data.object === 'error') {
      console.error('Notion API error:', data);
      return res.status(400).json({ success: false, error: data.message });
    }

    res.json({ success: true, id: data.id, data });
  } catch (error) {
    console.error('Error creating endorsement:', error);
    res.status(500).json({ success: false, error: 'Failed to create endorsement' });
  }
}
