import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';

/**
 * Resolver de GraphQL para la entidad {@link Task}.
 *
 * Expone las queries y mutations que permiten interactuar con el sistema de
 * gestión de tareas a través de la API GraphQL. Delega toda la lógica de
 * negocio al {@link TasksService}.
 *
 * @example
 * Query para obtener todas las tareas:
 * ```graphql
 * query {
 *   tasks {
 *     id
 *     title
 *     status
 *     assignedTo
 *   }
 * }
 * ```
 */
@Resolver(() => Task)
export class TasksResolver {
  /**
   * Crea una instancia del resolver con la inyección del servicio de tareas.
   *
   * @param {TasksService} tasksService - Servicio con la lógica de negocio de tareas.
   */
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Query que retorna la lista completa de tareas.
   *
   * @returns {Task[]} Arreglo con todas las tareas almacenadas.
   */
  @Query(() => [Task], { name: 'tasks' })
  findAll(): Task[] {
    return this.tasksService.findAll();
  }

  /**
   * Query que retorna una tarea específica por su ID.
   *
   * @param {string} id - Identificador único (UUID) de la tarea.
   * @returns {Task} La tarea encontrada.
   * @throws {NotFoundException} Si la tarea no existe.
   */
  @Query(() => Task, { name: 'task' })
  findOne(@Args('id', { type: () => String }) id: string): Task {
    return this.tasksService.findOne(id);
  }

  /**
   * Mutation para crear una nueva tarea.
   *
   * @param {CreateTaskInput} createTaskInput - Datos de la nueva tarea.
   * @returns {Task} La tarea creada con su ID y fecha de creación generados.
   */
  @Mutation(() => Task)
  createTask(
    @Args('createTaskInput') createTaskInput: CreateTaskInput,
  ): Task {
    return this.tasksService.create(createTaskInput);
  }

  /**
   * Mutation para actualizar una tarea existente.
   *
   * @param {UpdateTaskInput} updateTaskInput - ID de la tarea y los campos a actualizar.
   * @returns {Task} La tarea con los datos actualizados.
   * @throws {NotFoundException} Si la tarea no existe.
   */
  @Mutation(() => Task)
  updateTask(
    @Args('updateTaskInput') updateTaskInput: UpdateTaskInput,
  ): Task {
    return this.tasksService.update(updateTaskInput);
  }

  /**
   * Mutation para eliminar una tarea por su ID.
   *
   * @param {string} id - Identificador único (UUID) de la tarea a eliminar.
   * @returns {boolean} `true` si la eliminación fue exitosa.
   * @throws {NotFoundException} Si la tarea no existe.
   */
  @Mutation(() => Boolean)
  removeTask(@Args('id', { type: () => String }) id: string): boolean {
    return this.tasksService.remove(id);
  }
}
