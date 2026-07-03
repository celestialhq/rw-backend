import { createZodDto } from 'nestjs-zod';

import { DeleteApiTokenCommand } from '@libs/contracts/commands';

export class DeleteApiTokenParamDto extends createZodDto(
    DeleteApiTokenCommand.RequestParamSchema,
) {}
export class DeleteApiTokenResponseDto extends createZodDto(DeleteApiTokenCommand.ResponseSchema) {}
