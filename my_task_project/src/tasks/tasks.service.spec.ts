import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';

const mockTasksRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockUser = {
  id: 'user1',
  username: 'testuser',
};

describe('TasksService', () => {
  let service: TasksService;
  let repository: any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useFactory: mockTasksRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get(getRepositoryToken(Task));
  });

  describe('getAllTasks', () => {
    it('returns all tasks for a user', async () => {
      const mockTasks = [{ id: '1' }, { id: '2' }];
      repository.find.mockResolvedValue(mockTasks);

      const result = await service.getAllTasks(mockUser as any);

      expect(repository.find).toHaveBeenCalledWith({
        where: { user: mockUser },
      });
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getTaskById', () => {
    it('returns the task if found', async () => {
      const mockTask = { id: '1' };
      repository.findOne.mockResolvedValue(mockTask);

      const result = await service.getTaskById('1', mockUser as any);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', user: mockUser },
      });
      expect(result).toEqual(mockTask);
    });

    it('throws NotFoundException if task is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getTaskById('1', mockUser as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('creates and saves a task', async () => {
      const dto = { title: 'Test', description: 'Desc' };
      const savedTask = {
        ...dto,
        status: TaskStatus.OPEN,
        user: mockUser,
      };

      repository.create.mockReturnValue(savedTask);
      repository.save.mockResolvedValue(savedTask);

      const result = await service.createTask(dto as any, mockUser as any);

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        status: TaskStatus.OPEN,
        user: mockUser,
      });
      expect(repository.save).toHaveBeenCalledWith(savedTask);
      expect(result).toEqual(savedTask);
    });
  });

  describe('updateTaskStatus', () => {
    it('updates task status', async () => {
      const task = { id: '1', status: TaskStatus.OPEN };
      repository.findOne.mockResolvedValue(task);
      repository.save.mockResolvedValue({ ...task, status: TaskStatus.DONE });

      const result = await service.updateTaskStatus(
        '1',
        TaskStatus.DONE,
        mockUser as any,
      );

      expect(repository.save).toHaveBeenCalledWith({
        ...task,
        status: TaskStatus.DONE,
      });
      expect(result.status).toBe(TaskStatus.DONE);
    });
  });

  describe('deleteTask', () => {
    it('deletes task successfully', async () => {
      repository.delete.mockResolvedValue({ affected: 1 });

      await expect(
        service.deleteTask('1', mockUser as any),
      ).resolves.not.toThrow();

      expect(repository.delete).toHaveBeenCalledWith({
        id: '1',
        user: mockUser,
      });
    });

    it('throws NotFoundException if task not found', async () => {
      repository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteTask('1', mockUser as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
