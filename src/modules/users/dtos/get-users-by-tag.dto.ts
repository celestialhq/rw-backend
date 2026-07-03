import { createZodDto } from 'nestjs-zod';

import { GetUserByTagCommand } from '@libs/contracts/commands';

export class GetUserByTagParamDto extends createZodDto(GetUserByTagCommand.RequestParamSchema) {}
export class GetUserByTagResponseDto extends createZodDto(GetUserByTagCommand.ResponseSchema) {}
