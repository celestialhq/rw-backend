import {
    FetchIpsCommand,
    FetchIpsResultCommand,
    DropConnectionsCommand,
    FetchUsersIpsResultCommand,
    FetchUsersIpsCommand,
} from '@contract/commands';
import { createZodDto } from 'nestjs-zod';

export class FetchIpsBodyParamDto extends createZodDto(FetchIpsCommand.RequestParamSchema) {}

export class FetchIpsResponseDto extends createZodDto(FetchIpsCommand.ResponseSchema) {}

export class FetchIpsResultParamDto extends createZodDto(
    FetchIpsResultCommand.RequestParamSchema,
) {}

export class FetchIpsResultResponseDto extends createZodDto(FetchIpsResultCommand.ResponseSchema) {}

export class DropConnectionsBodyDto extends createZodDto(
    DropConnectionsCommand.RequestBodySchema,
) {}

export class FetchUsersIpsParamDto extends createZodDto(FetchUsersIpsCommand.RequestParamSchema) {}

export class FetchUsersIpsResponseDto extends createZodDto(FetchUsersIpsCommand.ResponseSchema) {}

export class FetchUsersIpsResultParamDto extends createZodDto(
    FetchUsersIpsResultCommand.RequestParamSchema,
) {}

export class FetchUsersIpsResultResponseDto extends createZodDto(
    FetchUsersIpsResultCommand.ResponseSchema,
) {}
