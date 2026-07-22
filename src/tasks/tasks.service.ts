import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { TaskStatus } from './enums/task-status.enum';
import { LogExecutionTime } from '../common/decorators/log-execution-time.decorator';

/**
 * Servicio responsable de la lógica de negocio para la gestión de tareas.
 *
 * Implementa un almacenamiento en memoria (in-memory) usando un arreglo
 * privado. Expone operaciones CRUD completas: findAll, findOne, create,
 * update y remove.
 *
 * @remarks
 * El decorador {@link LogExecutionTime} se aplica a cada método para registrar
 * automáticamente el tiempo de ejecución (AOP – Aspecto de rendimiento).
 *
 * @example
 * ```typescript
 * const task = tasksService.create({
 *   title: 'Fix bug',
 *   description: 'Descripción del bug',
 *   assignedTo: 'Mario',
 *   projectId: 'proj-1',
 * });
 * ```
 */
@Injectable()
export class TasksService {
  /** Logger interno del servicio para registrar operaciones. */
  private readonly logger = new Logger(TasksService.name);

  /** Arreglo en memoria que actúa como fuente de datos de las tareas. */
  private tasks: Task[] = [];

  /**
   * Retorna la lista completa de tareas almacenadas.
   *
   * @returns {Task[]} Arreglo con todas las tareas.
   */
  @LogExecutionTime()
  findAll(): Task[] {
    this.logger.log(`findAll called - returning ${this.tasks.length} tasks`);
    return this.tasks;
  }

  /**
   * Busca y retorna una tarea por su identificador único.
   *
   * @param {string} id - El UUID de la tarea a buscar.
   * @returns {Task} La tarea encontrada.
   * @throws {NotFoundException} Si no existe ninguna tarea con el ID proporcionado.
   */
  @LogExecutionTime()
  findOne(id: string): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      this.logger.warn(`findOne: Task with id "${id}" not found`);
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    this.logger.log(`findOne: Found task "${task.title}" (id: ${id})`);
    return task;
  }

  /**
   * Crea una nueva tarea a partir de los datos de entrada y la almacena en memoria.
   *
   * Se genera automáticamente un UUID como identificador y se asigna
   * la fecha de creación con new Date().
   *
   * @param {CreateTaskInput} input - Datos necesarios para crear la tarea.
   * @returns {Task} La tarea recién creada con todos sus campos completos.
   */
  @LogExecutionTime()
  create(input: CreateTaskInput): Task {
    const newTask: Task = {
      id: uuidv4(),
      title: input.title,
      description: input.description,
      status: input.status ?? TaskStatus.BACKLOG,
      tags: input.tags ?? [],
      createdAt: new Date(),
      assignedTo: input.assignedTo,
      projectId: input.projectId,
    };
    this.tasks.push(newTask);
    this.logger.log(
      `create: New task created - "${newTask.title}" (id: ${newTask.id})`,
    );
    return newTask;
  }

  /**
   * Actualiza los campos de una tarea existente identificada por su ID.
   *
   * Solo se actualizan los campos que estén presentes en UpdateTaskInput
   * (todos son opcionales excepto id).
   *
   * @param {UpdateTaskInput} input - Objeto con el ID de la tarea y los campos a modificar.
   * @returns {Task} La tarea actualizada.
   * @throws {NotFoundException} Si no existe ninguna tarea con el ID proporcionado.
   */
  @LogExecutionTime()
  update(input: UpdateTaskInput): Task {
    const task = this.findOne(input.id);

    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.status !== undefined) task.status = input.status;
    if (input.tags !== undefined) task.tags = input.tags;
    if (input.assignedTo !== undefined) task.assignedTo = input.assignedTo;
    if (input.projectId !== undefined) task.projectId = input.projectId;

    this.logger.log(`update: Task "${task.title}" (id: ${task.id}) updated`);
    return task;
  }

  /**
   * Elimina una tarea del almacenamiento en memoria.
   *
   * @param {string} id - El UUID de la tarea a eliminar.
   * @returns {boolean} true si la tarea fue eliminada exitosamente.
   * @throws {NotFoundException} Si no existe ninguna tarea con el ID proporcionado.
   */
  @LogExecutionTime()
  remove(id: string): boolean {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      this.logger.warn(`remove: Task with id "${id}" not found`);
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    const [removed] = this.tasks.splice(index, 1);
    this.logger.log(`remove: Task "${removed.title}" (id: ${id}) removed`);
    return true;
  }
}
