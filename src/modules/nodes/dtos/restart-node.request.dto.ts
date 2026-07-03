import { RestartNodeCommand } from '@contract/commands';
import { createZodDto } from 'nestjs-zod';

export class RestartNodeParamDto extends createZodDto(RestartNodeCommand.RequestParamSchema) {}
export class RestartNodeBodyDto extends createZodDto(RestartNodeCommand.RequestBodySchema) {}
export class RestartNodeResponseDto extends createZodDto(RestartNodeCommand.ResponseSchema) {}
