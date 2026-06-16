import { createZodDto } from 'nestjs-zod';

import { RestartNodeCommand } from '@contract/commands';

export class RestartNodeRequestDto extends createZodDto(RestartNodeCommand.RequestSchema) {}
export class RestartNodeRequestQueryDto extends createZodDto(
    RestartNodeCommand.RequestQuerySchema,
) {}
export class RestartNodeResponseDto extends createZodDto(RestartNodeCommand.ResponseSchema) {}
