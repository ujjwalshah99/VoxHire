import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req) {

    const {jobPosition,
    jobDescription,
    duration,
    difficultyLevel,
    questionTypes,
    customQuestions} = await req.json();

    let typeof_questions = [];
    for(const key in questionTypes) {
        if(questionTypes[key] === true) {
            typeof_questions.push(key);
        }
    }
    typeof_questions = typeof_questions.join(", ");

    const PROMPT = `
        Based on the following inputs, generate a well-structured list of high-quality interview questions:
        Job Title: ${jobPosition}
        Job Description: ${jobDescription}
        Interview Duration: ${duration}
        Question Types: {${typeof_questions}}
        Difficulty Level: ${difficultyLevel}
        Custom Questions: {${customQuestions}}
        Your task:
        1. Your Qestions must include these questions {${customQuestions}} , these questions can be modified according to the needs of the interview but main context of these quetions must be same.
        2. Analyze the job description to identify key responsibilities, required skills, and expected experience.
        3. Generate a list of interview questions depends on interview duration
        4. Adjust the number and depth of questions to match the interview duration and difficulty level.
        5. Ensure the questions match the tone and structure of a real-life {${questionTypes}} interview.
        6. Format your response in JSON format defined below.
            output format: interviewQuestions=
            [
            {
            id:1,
            type: technical/behavioral/experience/problemSolving/leadership,
            question: ...
            },{
            id:2,
            type: technical/behavioral/experience/problemSolving/leadership,
            question: ...
            },
            ...
            ]


        The goal is to create a structured, relevant, and time-optimized interview plan for a ${jobPosition} role.`

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: PROMPT,
            config: {
                systemInstruction: `You are an expert technical interviewer having a experience of over 15 years.
                Example 1: 
                        input:
                        "Job Title": "Data Scientist",
                        "Job Description": "Responsible for building predictive models, working with large datasets, and communicating data insights effectively.",
                        "Interview Duration": 60,
                        "Question Types": ["technical", "experience", "problemSolving", "behavioral"],
                        "Difficulty Level": "advanced",
                        "Custom Questions": ["What is overfitting in machine learning?"]
                        
                        output:
                        "interviewQuestions": [
                            { "id": 1, "type": "technical", "question": "What is overfitting in machine learning, and how can it be prevented?" },
                            { "id": 2, "type": "technical", "question": "Explain the bias-variance tradeoff with examples." },
                            { "id": 3, "type": "technical", "question": "Describe the differences between classification and regression algorithms." },
                            { "id": 4, "type": "technical", "question": "How do ensemble methods like bagging and boosting improve model performance?" },
                            { "id": 5, "type": "technical", "question": "What is feature engineering, and why is it important?" },
                            { "id": 6, "type": "experience", "question": "Describe a project where you built a predictive model from scratch. What tools and techniques did you use?" },
                            { "id": 7, "type": "experience", "question": "Have you ever worked with real-time data pipelines? How did you ensure performance and reliability?" },
                            { "id": 8, "type": "problemSolving", "question": "How would you handle a dataset with 60% missing values?" },
                            { "id": 9, "type": "problemSolving", "question": "How would you detect data leakage in a model?" },
                            { "id": 10, "type": "behavioral", "question": "Tell me about a time when you had to explain a complex data insight to a non-technical audience." },
                            { "id": 11, "type": "behavioral", "question": "Describe a situation where your team disagreed on the modeling approach. How did you handle it?" }
                        ]
                        }
                    
                    
                Example 2:
                        input:
                        "Job Title": "DevOps Engineer",
                        "Job Description": "Should automate deployments, manage CI/CD pipelines, and handle cloud infrastructure.",
                        "Interview Duration": 45,
                        "Question Types": ["technical", "problemSolving", "experience"],
                        "Difficulty Level": "intermediate",
                        "Custom Questions": ["What is Infrastructure as Code (IaC)?"]
                        
                        output:
                        "interviewQuestions": [
                            { "id": 1, "type": "technical", "question": "What is Infrastructure as Code (IaC), and how is it implemented using tools like Terraform or CloudFormation?" },
                            { "id": 2, "type": "technical", "question": "How do Docker and Kubernetes work together to support scalable deployments?" },
                            { "id": 3, "type": "technical", "question": "What monitoring tools have you used to track application health and system performance?" },
                            { "id": 4, "type": "technical", "question": "Explain blue-green deployment and its advantages." },
                            { "id": 5, "type": "experience", "question": "Tell me about a time when you reduced deployment time or errors significantly." },
                            { "id": 6, "type": "experience", "question": "Have you ever managed a migration from on-premise to cloud infrastructure? What challenges did you face?" },
                            { "id": 7, "type": "problemSolving", "question": "You detect a memory leak in a containerized app. How would you approach identifying the root cause?" },
                            { "id": 8, "type": "problemSolving", "question": "How would you design a CI/CD pipeline for a microservices architecture with multiple repositories?" },
                            { "id": 9, "type": "problemSolving", "question": "An app you deployed is crashing intermittently under load. What steps do you take to troubleshoot?" }
                        ]
                        }

                Example 3: 
                        input:
                        "Job Title": "UI/UX Designer",
                        "Job Description": "Responsible for designing intuitive, user-friendly interfaces, conducting user research, and creating wireframes and prototypes.",
                        "Interview Duration": 30,
                        "Question Types": ["experience", "behavioral", "technical"],
                        "Difficulty Level": "intermediate",
                        "Custom Questions": ["What is user-centered design?"]
                        
                        output:
                        "interviewQuestions": [
                            { "id": 1, "type": "technical", "question": "What is user-centered design, and how do you apply it throughout the design process?" },
                            { "id": 2, "type": "technical", "question": "What are the key differences between UX and UI design?" },
                            { "id": 3, "type": "technical", "question": "Which accessibility guidelines do you follow when designing interfaces?" },
                            { "id": 4, "type": "technical", "question": "How do you validate design decisions using A/B testing or usability testing?" },
                            { "id": 5, "type": "experience", "question": "Tell me about a time you redesigned an existing product interface. What was your process and outcome?" },
                            { "id": 6, "type": "experience", "question": "Have you ever worked closely with developers to implement your designs? What was that collaboration like?" },
                            { "id": 7, "type": "experience", "question": "Describe a project where you applied user research to influence a major design decision." },
                            { "id": 8, "type": "behavioral", "question": "Tell me about a time you had to defend your design decisions during a team review." },
                            { "id": 9, "type": "behavioral", "question": "Describe how you manage feedback from multiple stakeholders with conflicting opinions." },
                            { "id": 10, "type": "behavioral", "question": "What do you do when your design work is blocked by unclear product requirements?" }
                        ]
                        }


            important : 
            the type of the question must be on thr basis of questionTypes which is true 
            expamle:
            if questionTypes = [ technical, experience, problemSolving ]
            then the type of the question must be either technical or experience or problemSolving
            if questionTypes = [ technical: true, behavioral: true ]
            then the type of the question generated must not include experience or problemSolving or leadership`,
                temperature: 0.4,
            },
        });
        console.log(response.text);
        return NextResponse.json(response.text);

    } catch(err) {
        console.log("AI error" , err);
        return NextResponse.json(err);
    }
}