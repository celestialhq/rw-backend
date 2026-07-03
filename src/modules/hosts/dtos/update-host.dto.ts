import { createZodDto } from 'nestjs-zod';

import { UpdateHostCommand } from '@libs/contracts/commands';

export class UpdateHostBodyDto extends createZodDto(UpdateHostCommand.RequestBodySchema) {}
export class UpdateHostResponseDto extends createZodDto(UpdateHostCommand.ResponseSchema) {}
