import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { TaskStatus } from './enums/task-status.enum';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: string): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    return task;
  }

  create(input: CreateTaskInput): Task {
    const task: Task = {
      id: uuidv4(),
      title: input.title,
      description: input.description,
      status: input.status ?? TaskStatus.BACKLOG,
      tags: input.tags ?? [],
      createdAt: new Date(),
      assignedTo: input.assignedTo,
      projectId: input.projectId,
    };
    this.tasks.push(task);
    return task;
  }

  update(input: UpdateTaskInput): Task {
    const task = this.findOne(input.id);
    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.status !== undefined) task.status = input.status;
    if (input.tags !== undefined) task.tags = input.tags;
    if (input.assignedTo !== undefined) task.assignedTo = input.assignedTo;
    if (input.projectId !== undefined) task.projectId = input.projectId;
    return task;
  }

  remove(id: string): boolean {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    this.tasks.splice(index, 1);
    return true;
  }
}
