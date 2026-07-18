import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsArray, IsOptional, IsEnum, ArrayMinSize } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

@InputType()
export class CreateTaskInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => TaskStatus, { nullable: true, defaultValue: TaskStatus.BACKLOG })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field()
  @IsString()
  assignedTo: string;

  @Field()
  @IsString()
  projectId: string;
}
