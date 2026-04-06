import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from './task-status.enum';
import { Repository } from 'typeorm';
import { User } from 'src/modules/auth/user.entity';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService');

  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.tasksRepository.findOne({ where: { id, user } });
    this.logger.verbose(
      `Retrieving task with ID "${id}" for user "${user.username}"`,
    );

    if (!found) {
      this.logger.warn(
        `Task with ID "${id}" not found for user "${user.username}"`,
      );
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      status: TaskStatus.OPEN,
      user,
    });
    this.logger.verbose(
      `Creating a new task for user "${user.username}": ${JSON.stringify(createTaskDto)}`,
    );

    return this.tasksRepository.save(task);
  }

  async getAllTasks(user: User): Promise<Task[]> {
    return this.tasksRepository.find({ where: { user } });
  }

  async getTaskWithFilters(
    filterDto: GetTasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.tasksRepository.createQueryBuilder('task');
    query.where('task.userId = :userId', { userId: user.id });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    try {
      this.logger.verbose(
        `User "${user.username}" retrieving tasks with filters: ${JSON.stringify(filterDto)}`,
      );
      return query.getMany();
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${user.username}" with filters ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new NotFoundException();
    }
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await this.tasksRepository.save(task);
    return task;
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const result = await this.tasksRepository.delete({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}
