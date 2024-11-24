import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';

export const addCandidate = async (candidateData: any) => {
    try {
        validateCandidateData(candidateData); // Validate candidate data
    } catch (error: any) {
        throw new Error(error);
    }

    const candidate = new Candidate(candidateData); // Create a Candidate instance
    try {
        const savedCandidate = await candidate.save(); // Save the candidate
        if (!savedCandidate) {
            throw new Error('Failed to save candidate'); // Handle case where save fails
        }
        const candidateId = savedCandidate.id; // Get the ID of the saved candidate

        // Save education, work experience, and resumes as before...

        return savedCandidate;
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new Error('The email already exists in the database');
        } else {
            throw error;
        }
    }
};