import { ResetNodeTrafficCommand } from '@contract/commands';
import { createZodDto } from 'nestjs-zod';

export class ResetNodeTrafficParamDto extends createZodDto(
    ResetNodeTrafficCommand.RequestParamSchema,
) {}
export class ResetNodeTrafficResponseDto extends createZodDto(
    ResetNodeTrafficCommand.ResponseSchema,
) {}
