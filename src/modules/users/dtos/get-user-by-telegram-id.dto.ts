import { createZodDto } from 'nestjs-zod';

import { GetUserByTelegramIdCommand } from '@libs/contracts/commands';

export class GetUserByTelegramIdParamDto extends createZodDto(
    GetUserByTelegramIdCommand.RequestParamSchema,
) {}
export class GetUserByTelegramIdResponseDto extends createZodDto(
    GetUserByTelegramIdCommand.ResponseSchema,
) {}
