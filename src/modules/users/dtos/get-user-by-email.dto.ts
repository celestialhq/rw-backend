import { createZodDto } from 'nestjs-zod';

import { GetUserByEmailCommand } from '@libs/contracts/commands';

export class GetUserByEmailParamDto extends createZodDto(
    GetUserByEmailCommand.RequestParamSchema,
) {}
export class GetUserByEmailResponseDto extends createZodDto(GetUserByEmailCommand.ResponseSchema) {}
