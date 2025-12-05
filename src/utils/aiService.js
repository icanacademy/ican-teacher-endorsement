// AI Service for generating endorsement content
// Uses OpenAI GPT for intelligent responses

const OPENAI_API_KEY = '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';

const CURRICULUM_DATA = {
  'Book Club': {
    'Charlotte\'s Web': {
      chapters: ['Chapter 1: Before Breakfast', 'Chapter 2: Wilbur', 'Chapter 3: Escape', 'Chapter 4: Loneliness', 'Chapter 5: Charlotte', 'Chapter 6: Summer Days'],
      activities: ['Character web', 'Vocabulary study', 'Reading comprehension', 'Story mapping'],
    },
    'Wonder': {
      chapters: ['Part 1: August', 'Part 2: Via', 'Part 3: Summer', 'Part 4: Jack', 'Part 5: Justin'],
      activities: ['Empathy journal', 'Character analysis', 'Theme discussion', 'Precept writing'],
    },
    'Harry Potter': {
      chapters: ['Chapter 1: The Boy Who Lived', 'Chapter 2: The Vanishing Glass', 'Chapter 3: Letters from No One', 'Chapter 4: The Keeper of the Keys'],
      activities: ['World building', 'Character development', 'Plot analysis', 'Creative writing'],
    },
  },
  'Grammar to Writing': {
    'Level 1': ['Parts of Speech', 'Nouns and Pronouns', 'Verbs', 'Adjectives', 'Adverbs', 'Prepositions'],
    'Level 2': ['Simple Sentences', 'Compound Sentences', 'Complex Sentences', 'Subject-Verb Agreement', 'Tenses'],
    'Level 3': ['Paragraph Structure', 'Topic Sentences', 'Supporting Details', 'Transitions', 'Conclusions'],
  },
  'Essay Writing': {
    'Beginner': ['Introduction to Essay', 'Thesis Statement', 'Body Paragraphs', 'Conclusion'],
    'Intermediate': ['Argumentative Essay', 'Persuasive Essay', 'Compare and Contrast', 'Cause and Effect'],
    'Advanced': ['Research Essay', 'Critical Analysis', 'Synthesis Essay', 'Reflection Essay'],
  },
};

// Get the next logical lesson based on the last lesson
function getNextLesson(classType, book, lastLesson) {
  const cleanLastLesson = lastLesson.toLowerCase().trim();

  if (classType === 'Book Club') {
    // Find the book in our curriculum
    for (const [bookName, data] of Object.entries(CURRICULUM_DATA['Book Club'])) {
      if (book.toLowerCase().includes(bookName.toLowerCase())) {
        const chapters = data.chapters;
        for (let i = 0; i < chapters.length - 1; i++) {
          if (cleanLastLesson.includes(`chapter ${i + 1}`) ||
              chapters[i].toLowerCase().includes(cleanLastLesson)) {
            return chapters[i + 1];
          }
        }
      }
    }
    // Default progression
    const chapterMatch = cleanLastLesson.match(/chapter\s*(\d+)/i);
    if (chapterMatch) {
      const nextChapter = parseInt(chapterMatch[1]) + 1;
      return `Chapter ${nextChapter}`;
    }
  }

  if (classType === 'Grammar to Writing') {
    for (const [level, topics] of Object.entries(CURRICULUM_DATA['Grammar to Writing'])) {
      for (let i = 0; i < topics.length - 1; i++) {
        if (cleanLastLesson.includes(topics[i].toLowerCase())) {
          return topics[i + 1];
        }
      }
    }
  }

  // Generic next lesson suggestion
  return `Continue from: ${lastLesson} - next section`;
}

// Generate summary based on class type and lesson
function generateSummary(classType, book, lastLesson) {
  const summaries = {
    'Book Club': `Student completed reading and discussion of ${lastLesson} from ${book}. Focus was on comprehension, vocabulary, and character analysis.`,
    'Grammar to Writing': `Student practiced ${lastLesson} with emphasis on grammar rules and sentence construction. Exercises included identification and application activities.`,
    'Essay Writing': `Student worked on ${lastLesson}. Focus included structure, organization, and developing clear arguments with supporting evidence.`,
    'Reading to Writing': `Student completed ${lastLesson} with focus on reading comprehension and written response. Worked on connecting reading to writing skills.`,
    'Debate & Discussion': `Student participated in discussion on ${lastLesson}. Practiced forming arguments, listening to others, and responding thoughtfully.`,
    'Reading Comprehension': `Student worked through ${lastLesson}, focusing on understanding main ideas, details, and making inferences from the text.`,
    'Vocabulary Building': `Student studied ${lastLesson}, learning new words, definitions, and usage in context.`,
    'Speaking & Listening': `Student practiced ${lastLesson} with focus on pronunciation, fluency, and active listening skills.`,
    'Test Preparation': `Student completed practice on ${lastLesson}, focusing on test-taking strategies and content review.`,
    'Creative Writing': `Student worked on ${lastLesson}, developing creativity, voice, and narrative techniques.`,
  };

  return summaries[classType] || `Student completed ${lastLesson} in ${book}. Made good progress with the material covered.`;
}

// Generate homework based on class type and ICAN standards
function generateHomework(classType, book, lastLesson) {
  const homeworkOptions = {
    'Book Club': [
      `Complete Caterpillar activity for ${lastLesson}`,
      `Prepare 3 Quiz Challenge questions about the reading`,
      `Write a short character reflection (3-5 sentences)`,
      `Review vocabulary from the chapter`,
    ],
    'Grammar to Writing': [
      `Complete sentence construction exercises (pg. relevant)`,
      `Write Visionary Journal entry using today's grammar concept`,
      `Practice worksheet for ${lastLesson}`,
      `Write 5 original sentences using the grammar rule`,
    ],
    'Essay Writing': [
      `Write a paragraph practicing today's structure`,
      `Complete essay outline for assigned topic`,
      `Revise and edit previous draft`,
      `Research and take notes for upcoming essay`,
    ],
    'Reading to Writing': [
      `Complete reading comprehension questions`,
      `Write a summary paragraph (5-7 sentences)`,
      `Vocabulary practice from the reading`,
      `Response journal entry`,
    ],
    'Debate & Discussion': [
      `Prepare 2-3 arguments for the next discussion topic`,
      `Research supporting evidence`,
      `Write a reflection on today's discussion`,
    ],
    'Reading Comprehension': [
      `Complete comprehension worksheet`,
      `Write answers to discussion questions`,
      `Practice vocabulary from the reading`,
    ],
    'Vocabulary Building': [
      `Study flashcards for new vocabulary`,
      `Write sentences using 5 new words`,
      `Complete vocabulary worksheet`,
    ],
    'Speaking & Listening': [
      `Practice pronunciation with audio recording`,
      `Prepare a short speech on assigned topic`,
      `Listen to English content and summarize`,
    ],
    'Test Preparation': [
      `Complete practice test section`,
      `Review incorrect answers`,
      `Study vocabulary and concepts`,
    ],
    'Creative Writing': [
      `Continue working on creative piece`,
      `Free writing journal entry (10 minutes)`,
      `Complete creative writing prompt`,
    ],
  };

  const options = homeworkOptions[classType] || ['Review today\'s material', 'Complete assigned worksheet'];

  // Return first two homework items
  return options.slice(0, 2).join('\n');
}

// Generate a detailed lesson plan based on teacher inputs
export async function generateLessonPlan(data) {
  const { classType, bookMaterial, lastLesson, nextLesson, homework, notes, duration, studentName, timeDisplay } = data;

  // Each hour has 50 minutes of teaching + 10 minute break
  const teachingMinutes = duration * 50;
  const totalMinutesWithBreaks = duration * 60;

  const systemPrompt = `You are ICAN Academy's Lesson Plan Assistant.
Your job is to:
1. Polish and improve the teacher's input text (make it clearer and more professional)
2. Create a detailed, structured lesson plan for a substitute teacher

The lesson plan should be clear, practical, and easy to follow.
Include time breakdowns based on the class duration.
Make it professional and ready to print.

IMPORTANT: At ICAN Academy, each class hour includes a 10-minute break at the end.
So for a 1-hour class, there are 50 minutes of teaching time.
For a 2-hour class, there are 100 minutes of teaching time (50 min + break + 50 min + break).
Always include the break times in the schedule.`;

  const userPrompt = `Create a detailed lesson plan for the following class. First, polish the teacher's notes to be clearer and more professional, then create the lesson plan.

CLASS DETAILS:
- Student: ${studentName}
- Class Type: ${classType}
- Duration: ${duration} hour${duration > 1 ? 's' : ''} (${timeDisplay})
- Teaching Time: ${teachingMinutes} minutes (with ${duration * 10} minutes of breaks)
- Book/Material: ${bookMaterial}

TEACHER'S NOTES (please polish these):
- Last Lesson Covered: ${lastLesson}
- Today's Lesson Topic: ${nextLesson}
${homework ? `- Homework to Assign: ${homework}` : ''}
${notes ? `- Special Notes: ${notes}` : ''}

Please respond in this EXACT format:

=== POLISHED NOTES ===
LAST LESSON: [Polished version of what was covered]
TODAY'S LESSON: [Polished version of today's topic]
${homework ? `HOMEWORK: [Polished homework assignment]` : ''}
${notes ? `NOTES: [Polished special notes]` : ''}

=== LESSON PLAN ===
[Detailed lesson plan with time allocations]

Remember:
- Each hour = 50 minutes teaching + 10 minute break
- Include break times in the schedule

Structure for the lesson plan:
1. WARM-UP (5-10 minutes) - Review of previous lesson
2. MAIN LESSON - Broken into logical segments with time estimates
3. ACTIVITIES - Practice exercises or interactive activities
4. BREAK (10 minutes) - at the end of each hour
5. WRAP-UP (5 minutes before final break) - Summary and homework assignment

Format the plan clearly with specific time allocations.
Make it practical and easy for a substitute teacher to follow.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    const responseData = await response.json();

    if (responseData.error) {
      console.error('OpenAI API error:', responseData.error);
      return { lessonPlan: fallbackLessonPlan(data) };
    }

    const content = responseData.choices[0].message.content;

    // Parse the polished notes and lesson plan
    const result = {
      lessonPlan: content,
      polishedLastLesson: null,
      polishedNextLesson: null,
      polishedHomework: null,
      polishedNotes: null,
    };

    // Extract polished notes
    const lastLessonMatch = content.match(/LAST LESSON:\s*(.+?)(?=\n|TODAY'S LESSON:|$)/is);
    const todayLessonMatch = content.match(/TODAY'S LESSON:\s*(.+?)(?=\n|HOMEWORK:|NOTES:|===|$)/is);
    const homeworkMatch = content.match(/HOMEWORK:\s*(.+?)(?=\n|NOTES:|===|$)/is);
    const notesMatch = content.match(/NOTES:\s*(.+?)(?=\n|===|$)/is);

    if (lastLessonMatch) result.polishedLastLesson = lastLessonMatch[1].trim();
    if (todayLessonMatch) result.polishedNextLesson = todayLessonMatch[1].trim();
    if (homeworkMatch) result.polishedHomework = homeworkMatch[1].trim();
    if (notesMatch) result.polishedNotes = notesMatch[1].trim();

    // Extract just the lesson plan part
    const lessonPlanMatch = content.match(/=== LESSON PLAN ===\s*([\s\S]*)/i);
    if (lessonPlanMatch) {
      result.lessonPlan = lessonPlanMatch[1].trim();
    }

    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return fallbackLessonPlan(data);
  }
}

// Fallback lesson plan if API fails
function fallbackLessonPlan(data) {
  const { classType, bookMaterial, lastLesson, nextLesson, duration } = data;
  const teachingMinutes = duration * 50; // 50 min teaching + 10 min break per hour

  let plan = `LESSON PLAN
═══════════════════════════════════════

`;

  for (let hour = 1; hour <= duration; hour++) {
    const hourStart = (hour - 1) * 60;
    plan += `HOUR ${hour} (50 minutes teaching + 10 minute break)
───────────────────────────────────────

`;
    if (hour === 1) {
      plan += `WARM-UP (10 minutes)
• Review previous lesson: ${lastLesson}
• Quick Q&A to check understanding

MAIN LESSON (25 minutes)
• Topic: ${nextLesson}
• Material: ${bookMaterial}
• Class Type: ${classType}

PRACTICE ACTIVITY (15 minutes)
• Guided practice exercises
• Individual or paired work

☕ BREAK (10 minutes)
───────────────────────────────────────

`;
    } else {
      plan += `CONTINUED LESSON (25 minutes)
• Continue with ${nextLesson}
• Build on previous hour's content

PRACTICE/ACTIVITY (20 minutes)
• Extended practice
• Apply concepts learned

WRAP-UP (5 minutes)
• Summarize key points
• Assign homework
• Preview next lesson

☕ BREAK (10 minutes)
───────────────────────────────────────

`;
    }
  }

  plan += `═══════════════════════════════════════
Note: This is an auto-generated plan. Please adapt as needed.`;

  return plan;
}

// Main AI generation function - uses OpenAI (legacy - kept for compatibility)
export async function generateEndorsementContent(classType, book, lastLesson) {
  const systemPrompt = `You are ICAN Academy's Endorsement Assistant.
Your job is to generate clean, correct, ICAN-standard class endorsements based only on the information given.
Make the outputs clear, professional, and helpful for a substitute teacher.
Keep responses concise and practical.`;

  const userPrompt = `Class Type: ${classType}
Book / Material: ${book}
Last Lesson Covered: ${lastLesson}

Please produce the following sections:

1. SUMMARY - 1-2 sentences describing what was covered in the lesson
2. NEXT LESSON - Clear and specific next step for the substitute teacher
3. HOMEWORK - Appropriate homework assignment following ICAN standards

Format it exactly like this:

SUMMARY:
[1-2 sentences describing what was covered]

NEXT LESSON:
[Clear and correct next step]

HOMEWORK:
[ICAN-standard homework based on class type]`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return fallbackGeneration(classType, book, lastLesson);
    }

    const content = data.choices[0].message.content;

    // Parse the response
    const summaryMatch = content.match(/SUMMARY:\s*([\s\S]*?)(?=NEXT LESSON:|$)/i);
    const nextLessonMatch = content.match(/NEXT LESSON:\s*([\s\S]*?)(?=HOMEWORK:|$)/i);
    const homeworkMatch = content.match(/HOMEWORK:\s*([\s\S]*?)$/i);

    return {
      summary: summaryMatch ? summaryMatch[1].trim() : '',
      nextLesson: nextLessonMatch ? nextLessonMatch[1].trim() : '',
      homework: homeworkMatch ? homeworkMatch[1].trim() : '',
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return fallbackGeneration(classType, book, lastLesson);
  }
}

// Fallback to local generation if API fails
function fallbackGeneration(classType, book, lastLesson) {
  const summary = generateSummary(classType, book, lastLesson);
  const nextLesson = getNextLesson(classType, book, lastLesson);
  const homework = generateHomework(classType, book, lastLesson);

  return {
    summary,
    nextLesson,
    homework,
  };
}

// For real AI integration, use this function with your API
export async function generateWithOpenAI(classType, book, lastLesson, apiKey) {
  const systemPrompt = `You are ICAN Academy's Endorsement Assistant.
Your job is to generate clean, correct, ICAN-standard class endorsements based only on the information given.
Make the outputs clear, professional, and helpful for a substitute teacher.`;

  const userPrompt = `Class Type: ${classType}
Book / Material: ${book}
Last Lesson Covered: ${lastLesson}

Please produce the following sections:

1. SUMMARY
2. NEXT LESSON
3. HOMEWORK

Format it exactly like this:

SUMMARY:
[1-2 sentences describing what was covered]

NEXT LESSON:
[Clear and correct next step]

HOMEWORK:
[ICAN-standard homework based on class type]`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the response
    const summaryMatch = content.match(/SUMMARY:\s*([\s\S]*?)(?=NEXT LESSON:|$)/i);
    const nextLessonMatch = content.match(/NEXT LESSON:\s*([\s\S]*?)(?=HOMEWORK:|$)/i);
    const homeworkMatch = content.match(/HOMEWORK:\s*([\s\S]*?)$/i);

    return {
      summary: summaryMatch ? summaryMatch[1].trim() : '',
      nextLesson: nextLessonMatch ? nextLessonMatch[1].trim() : '',
      homework: homeworkMatch ? homeworkMatch[1].trim() : '',
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fall back to local generation
    return generateEndorsementContent(classType, book, lastLesson);
  }
}
