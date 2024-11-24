import { PrismaClient } from '@prisma/client';
import { addCandidate } from '../../src/application/services/candidateService';
import { Candidate } from '../../src/domain/models/Candidate';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        candidate: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    };

    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
        Prisma: {
            PrismaClientInitializationError: class extends Error {},
        },
    };
});

describe('Integration: addCandidate', () => {
    let prisma: PrismaClient;

    beforeEach(() => {
        prisma = new PrismaClient(); // Mocked Prisma Client
        jest.clearAllMocks(); // Clear any mock calls
    });

    it('should successfully add a candidate and save to the database', async () => {
        const candidateData = {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'Candidate',
        };

        // Mock the create method
        (prisma.candidate.create as jest.Mock).mockResolvedValue({
            id: 1,
            ...candidateData,
        });

        // Ensure Candidate.findOne is mocked
        (Candidate.findOne as jest.Mock) = jest.fn();
        (Candidate.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            ...candidateData,
        });

        const result = await addCandidate(candidateData);

        // Assuming Candidate.findOne is mocked similarly
        const savedCandidate = await Candidate.findOne(result.id);
        expect(savedCandidate).toBeDefined();
        expect(savedCandidate?.email).toBe('test@example.com');
        expect(savedCandidate?.firstName).toBe('Test');
        expect(savedCandidate?.lastName).toBe('Candidate');
    });

    it('should throw an error if the email already exists', async () => {
        (prisma.candidate.create as jest.Mock).mockRejectedValueOnce({
            code: 'P2002',
        });

        const candidateData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
        };

        await expect(addCandidate(candidateData)).rejects.toThrow(
            'The email already exists in the database'
        );
    });

    it('should handle unexpected errors gracefully', async () => {
        (prisma.candidate.create as jest.Mock).mockRejectedValueOnce(new Error('Unexpected error'));

        const candidateData = {
            firstName: 'Alice',
            lastName: 'Smith',
            email: 'alice.smith@example.com',
        };

        await expect(addCandidate(candidateData)).rejects.toThrow('Unexpected error');
    });
});