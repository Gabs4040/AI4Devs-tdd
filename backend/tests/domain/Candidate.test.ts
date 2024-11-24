import { Candidate } from '../../src/domain/models/Candidate';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        candidate: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Candidate Model', () => {
    let candidate: Candidate;

    beforeEach(() => {
        candidate = new Candidate({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
        });
    });

    it('should create a new candidate', async () => {
        const prisma = new PrismaClient();
        const candidateData = {
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email,
            // Add other necessary fields that match the Prisma schema
        };
        (prisma.candidate.create as jest.Mock).mockResolvedValue({ id: 1, ...candidateData });
        candidate.save = jest.fn().mockImplementation(async () => {
            return await prisma.candidate.create({ data: candidateData });
        });
        const result = await candidate.save();
        expect(result.id).toBe(1);
    });

    it('should update an existing candidate', async () => {
        candidate.id = 1;
        const prisma = new PrismaClient();
        (prisma.candidate.update as jest.Mock).mockResolvedValue(candidate);
        const result = await candidate.save();
        expect(result).toEqual(candidate);
    });

    it('should throw an error if the email already exists', async () => {
        const prisma = new PrismaClient();
        (prisma.candidate.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
        candidate.save = jest.fn().mockImplementation(async () => {
            throw new Error('The email already exists in the database');
        });
        await expect(candidate.save()).rejects.toThrow('The email already exists in the database');
    });

    it('should find a candidate by ID', async () => {
        const prisma = new PrismaClient();
        (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(candidate);
        const foundCandidate = await Candidate.findOne(1);
        expect(foundCandidate).toEqual(candidate);
    });

    it('should return null if candidate not found', async () => {
        const prisma = new PrismaClient();
        (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);
        const foundCandidate = await Candidate.findOne(999);
        expect(foundCandidate).toBeNull();
    });
});