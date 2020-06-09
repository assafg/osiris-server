import { EventEmitter } from "events";

export interface DB {
    insertEvent(evt: any): Promise<Event>;
    getEvents(context: Context, seq?: number): Promise<Event[]>;
    getSnapshot(context: Context): Promise<Event> | null;
    saveState(context: Context, newState: any): Promise<any>;
    getState(context: Context): Promise<any>;
}

export interface Event {
    id?: string;
    seq?: number;
    isSnapshot?: boolean;
    [key: string]: any;
}

export type Context = {
    name: string;
    value: string | number;
};


export interface IConnector {
    connect(options?: any): Promise<any>;
    disconnect(): Promise<any>;
}

export abstract class Connector implements IConnector{
    eventEmitter: EventEmitter;

    constructor(_evenEmitter: EventEmitter) {
        this.eventEmitter = _evenEmitter;
    }

    connect(options?: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
    disconnect(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

