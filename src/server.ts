import express from 'express';
import { MongoDB } from './store/mongostore';
import { KafkaConnector } from './connectors/KafkaConnector';
import pino from 'pino-http';
import { DB, Event, Context } from './types';
import logger from './logger';
import { EventEmitter } from 'events';
import { reduce } from './reducers';

const app = express();

const store = new MongoDB('mongodb://localhost:27017/osiris', 'testCollection');
const eventEmitter = new EventEmitter();
const contextName = process.env.CONTEXT_NAME || 'id';

(async () => {
    await store.connect();
    app.use(pino());
    logger.info('Connected to store');

    const kafkaConnector = new KafkaConnector(eventEmitter);
    await kafkaConnector.connect();

    logger.info('Connected to Kafka');

    eventEmitter.on('message', saveToStore(store));
    eventEmitter.on('message', updateState(store));
    eventEmitter.on('message', logMessages);

    app.get('/', (req, res) => res.send('Hello World!'));

    app.listen(3000, () => console.log('Example app listening on port 3000!'));
})();

function saveToStore(store: DB) {
    return async (message: Event) => {
        return store.insertEvent(message);
    };
}

function updateState(store: DB) {
    return async (message: Event) => {
        const ctx: Context = { name: contextName, value: message[contextName] };
        const state = await store.getState(ctx);
        const newState = reduce(state, message);
        console.log('newState', newState);
        
        return store.saveState(ctx, newState);
    };
}

function logMessages(message: Event) {
    logger.debug(message);
}
