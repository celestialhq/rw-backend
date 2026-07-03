import { RestartAllNodesCommand } from '@contract/commands';
import { createZodDto } from 'nestjs-zod';

export class RestartAllNodesBodyDto extends createZodDto(
    RestartAllNodesCommand.RequestBodySchema,
) {}

export class RestartAllNodesResponseDto extends createZodDto(
    RestartAllNodesCommand.ResponseSchema,
) {}
