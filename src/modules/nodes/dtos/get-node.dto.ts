import { GetNodeCommand } from '@contract/commands';
import { createZodDto } from 'nestjs-zod';

export class GetNodeParamDto extends createZodDto(GetNodeCommand.RequestParamSchema) {}
export class GetNodeResponseDto extends createZodDto(GetNodeCommand.ResponseSchema) {}
