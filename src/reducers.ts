import { Event } from './types';
import { mergeWith } from 'lodash';
import { isObject } from 'util';
const aggregate = JSON.parse(process.env.AGGREGATE || '{}');

export function reduce(state: any, message: Event) : any {
    const obj = mergeWith({}, message, state, customizer);
    return obj; 
}

const customizer = (objValue: any, srcValue: any, key: string): any | null => {
    if (aggregate[key]) {
        return Number(objValue || 0) + Number(srcValue || 0);
    }

    // Delete existing value
    if (objValue === null) {
        return null;
    }
    if (objValue === null || objValue === undefined) {
        return srcValue;
    }
    if (isObject(objValue) && isObject(srcValue)) {
        // const obj = mergeWith(objValue, srcValue, this.customizer);
        const obj: Event = mergeWith(objValue, srcValue, customizer) as Event;
        return obj;
    }
    return objValue;
};

