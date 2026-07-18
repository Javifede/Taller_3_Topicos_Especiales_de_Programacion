import { Injectable } from '@nestjs/common';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  findAll(): Task[] {
    return [];
  }

  findOne(id: string): Task {
    return {} as Task;
  }

  create(input: CreateTaskInput): Task {
    return {} as Task;
  }

  update(input: UpdateTaskInput): Task {
    return {} as Task;
  }

  remove(id: string): boolean {
    return false;
  }
}
