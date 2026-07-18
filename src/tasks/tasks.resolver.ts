import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task], { name: 'tasks' })
  findAll(): Task[] {
    return this.tasksService.findAll();
  }

  @Query(() => Task, { name: 'task' })
  findOne(@Args('id', { type: () => String }) id: string): Task {
    return this.tasksService.findOne(id);
  }

  @Mutation(() => Task)
  createTask(@Args('createTaskInput') input: CreateTaskInput): Task {
    return this.tasksService.create(input);
  }

  @Mutation(() => Task)
  updateTask(@Args('updateTaskInput') input: UpdateTaskInput): Task {
    return this.tasksService.update(input);
  }

  @Mutation(() => Boolean)
  removeTask(@Args('id', { type: () => String }) id: string): boolean {
    return this.tasksService.remove(id);
  }
}
