import { expect } from 'chai';

import { reduce } from './reducers';

describe('Test reducers', () => {
    it('should reduce basic state', () => {
        const state = { id: '1' };
        const evt = { id: '1', email: 'Winona.Lockman52@yahoo.com' };
        let newState = reduce(state, evt);
        expect(newState).to.deep.equal({ id: '1', email: 'Winona.Lockman52@yahoo.com' });
        newState = reduce(newState, { id: '1', name: 'Ignacio Abernathy' });
        expect(newState).to.deep.equal({ id: '1', name: 'Ignacio Abernathy', email: 'Winona.Lockman52@yahoo.com' });
        newState = reduce(newState, {
            id: '1',
            address: {
                city: 'North Aliciaborough',
                streetAddress: '326 White Ports',
                country: 'Saint Barthelemy',
                zip: '81240-0225',
            },
        });
        expect(newState).to.deep.equal({
            id: '1',
            name: 'Ignacio Abernathy',
            email: 'Winona.Lockman52@yahoo.com',
            address: {
                city: 'North Aliciaborough',
                streetAddress: '326 White Ports',
                country: 'Saint Barthelemy',
                zip: '81240-0225',
            },
        });
    });
});
