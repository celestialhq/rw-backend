import { INodeConnectionOpts } from '@common/axios';

export interface IRecordNodeUsagePayload {
    nodeUuid: string;
    connectionOpts: INodeConnectionOpts;
}
