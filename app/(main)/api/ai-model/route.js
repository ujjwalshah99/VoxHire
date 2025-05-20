import OpenAI from 'openai';

export async function POST(req) {

    const {jobPosition,
    jobDescription,
    duration,
    difficultyLevel,
    questionTypes,
    customQuestions} = await req.json();

    const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPEN-ROUTER_API_KEY,
    });

    const PROMPT = `You are an expert technical interviewer having a experience of over 15 years.
        Based on the following inputs, generate a well-structured list of high-quality interview questions:
        Job Title: {${jobPosition}}
        Job Description:{${jobDescription}}
        Interview Duration: {${duration}}
        Question Types: {${questionTypes}}
        Difficulty Level: {${difficultyLevel}}
        Custom Questions: {${customQuestions}}
        Your task:
        1. Your Qestions must include these questions {${customQuestions}} , these questions can be modified according to the needs of the interview but main context of these quetions must be same.
        2. Analyze the job description to identify key responsibilities, required skills, and expected experience.
        3. Generate a list of interview questions depends on interview duration
        4. Adjust the number and depth of questions to match the interview duration and difficulty level.
        5. Ensure the questions match the tone and structure of a real-life {${questionTypes}} interview.
        6. Format your response in JSON format with array list of questions.
            output format: interviewQuestions=[
            {
            type:'Technical/Behavioral/Experince/Problem Solving/Leaseship'
            question:",
            },{
            ...
            }]
        The goal is to create a structured, relevant, and time-optimized interview plan for a {${jobTitle}} role.`

    const completion = await openai.chat.completions.create({
        model: "google/gemma-3-27b-it:free",
        messages: [
        {
            role: 'user',
            content: 'What is the meaning of life?',
        },
        ],
    });
    console.log(completion.choices[0].message);
}