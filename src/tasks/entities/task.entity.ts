import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { TaskStatus } from '../enums/task-status.enum';

registerEnumType(TaskStatus, { name: 'TaskStatus' });

@ObjectType()
export class Task {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => TaskStatus)
  status!: TaskStatus;

  @Field(() => [String])
  tags!: string[];

  @Field()
  createdAt!: Date;

  @Field()
  assignedTo!: string;

  @Field()
  projectId!: string;
}
