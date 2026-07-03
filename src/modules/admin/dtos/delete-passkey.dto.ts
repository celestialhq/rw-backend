import { createZodDto } from 'nestjs-zod';

import { DeletePasskeyCommand } from '@libs/contracts/commands';

export class DeletePasskeyBodyDto extends createZodDto(DeletePasskeyCommand.RequestBodySchema) {}
export class DeletePasskeyResponseDto extends createZodDto(DeletePasskeyCommand.ResponseSchema) {}
