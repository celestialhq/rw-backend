import { CreateNodeCommand } from '@contract/commands';
import { createZodDto } from 'nestjs-zod';

export class CreateNodeBodyDto extends createZodDto(CreateNodeCommand.RequestBodySchema) {}
export class CreateNodeResponseDto extends createZodDto(CreateNodeCommand.ResponseSchema) {}
