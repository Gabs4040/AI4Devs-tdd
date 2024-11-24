import { addCandidate } from '../src/application/services/candidateService';
import { Candidate } from '../src/domain/models/Candidate';
import { validateCandidateData } from '../src/application/validator';

jest.mock('../src/domain/models/Candidate');
jest.mock('../src/application/validator');

describe('addCandidate', () => {
    it('should successfully add a candidate', async () => {
        const candidateData = { email: 'test@example.com' };
        const mockCandidate = { save: jest.fn().mockResolvedValue({ id: 1 }) };
        (Candidate as unknown as jest.Mock).mockImplementation(() => mockCandidate);
        (validateCandidateData as jest.Mock).mockImplementation(() => {});

        const result = await addCandidate(candidateData);
        expect(result.id).toBe(1);
        expect(mockCandidate.save).toHaveBeenCalled();
    });

    it('should throw an error if validation fails', async () => {
        const candidateData = { email: 'invalid-email' };
        (validateCandidateData as jest.Mock).mockImplementation(() => {
            throw new Error('Validation error');
        });

        await expect(addCandidate(candidateData)).rejects.toThrow('Validation error');
    });

    // Add more tests for unique constraint errors and other scenarios
});
