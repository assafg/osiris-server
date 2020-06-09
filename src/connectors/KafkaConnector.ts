import { Connector, DB } from '../types';
import { EventEmitter } from 'events';
import { KafkaConsumer, LibrdKafkaError } from 'node-rdkafka';
import logger from '../logger';

const defaultOptions = {
    'group.id': 'kafka',
    'metadata.broker.list': 'localhost:9092',
    offset_commit_cb: function (err: any) {
        if (err) {
            // There was an error committing
            console.error(err);
        }
    },
};
export class KafkaConnector extends Connector {
    
    consumer: KafkaConsumer;
    eventEmitter: EventEmitter;

    connect(options: any = defaultOptions): Promise<any> {
        this.consumer = new KafkaConsumer(options, {});
        return new Promise((resolve: any, reject: any) => {
            this.consumer.connect({}, (err: LibrdKafkaError) => {
                if (err) {
                    return reject(err);
                }
            });
            this.consumer
                .on('ready', () => {
                    logger.debug('kafka connection ready');
                    
                    this.consumer.subscribe(['osiris-messages']);
                    this.consumer.consume();
                    return resolve();
                })
                .on('data', async (data) => {
                    try {
                        const message = JSON.parse(data.value.toString());
                        logger.debug('on message', message);
                        this.eventEmitter.emit('message', message);
                        // await this.store.insertEvent(message);
                        
                    } catch (err) {
                        console.error(err);
                    }
                });
        });
    }
    disconnect(): Promise<any> {
        return new Promise((resolve: any, reject: any) => {
            this.consumer.disconnect((err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }
}
