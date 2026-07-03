import { createZodDto } from 'nestjs-zod';

import {
    BulkDisableHostsCommand,
    BulkEnableHostsCommand,
    BulkDeleteHostsCommand,
    UpdateManyHostsCommand,
} from '@libs/contracts/commands';

export class BulkDeleteHostsBodyDto extends createZodDto(
    BulkDeleteHostsCommand.RequestBodySchema,
) {}
export class BulkDeleteHostsResponseDto extends createZodDto(
    BulkDeleteHostsCommand.ResponseSchema,
) {}

export class BulkDisableHostsBodyDto extends createZodDto(
    BulkDisableHostsCommand.RequestBodySchema,
) {}
export class BulkDisableHostsResponseDto extends createZodDto(
    BulkDisableHostsCommand.ResponseSchema,
) {}

export class BulkEnableHostsBodyDto extends createZodDto(
    BulkEnableHostsCommand.RequestBodySchema,
) {}
export class BulkEnableHostsResponseDto extends createZodDto(
    BulkEnableHostsCommand.ResponseSchema,
) {}

export class UpdateManyHostsBodyDto extends createZodDto(
    UpdateManyHostsCommand.RequestBodySchema,
) {}
export class UpdateManyHostsResponseDto extends createZodDto(
    UpdateManyHostsCommand.ResponseSchema,
) {}
