// Vercel Serverless Function - PATCH/DELETE /api/endorsements/[id]

const NOTION_API_KEY = process.env.NOTION_API_KEY;

const notionHeaders = {
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (req.method === 'PATCH') {
    return handlePatch(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handlePatch(req, res, id) {
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

    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: notionHeaders,
      body: JSON.stringify({ properties }),
    });

    const data = await response.json();

    if (data.object === 'error') {
      console.error('Notion API error:', data);
      return res.status(400).json({ success: false, error: data.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating endorsement:', error);
    res.status(500).json({ success: false, error: 'Failed to update endorsement' });
  }
}

async function handleDelete(req, res, id) {
  try {
    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: notionHeaders,
      body: JSON.stringify({ archived: true }),
    });

    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting endorsement:', error);
    res.status(500).json({ success: false, error: 'Failed to delete endorsement' });
  }
}
