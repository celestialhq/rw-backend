import { createZodDto } from 'nestjs-zod';

import { DisableUserCommand } from '@libs/contracts/commands';

export class DisableUserParamDto extends createZodDto(DisableUserCommand.RequestParamSchema) {}
export class DisableUserResponseDto extends createZodDto(DisableUserCommand.ResponseSchema) {}
