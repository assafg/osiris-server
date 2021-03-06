import { DB, Event, Context } from '../types';
import { MongoClient, Collection, Db } from 'mongodb';
import { v1 } from 'uuid';

const SEQ_ID = 'osiris-sequence';
export class MongoDB implements DB {
    _client: MongoClient;
    db: Db;
    collection: Collection;
    sequences: Collection;

    dbpath: string;
    collectionName: string;

    private static safeCollectionName(source: string): string {
        return source.replace(/[/\. "$]/, '_');
    }

    constructor(dbpath: string, collectionName: string) {
        this.dbpath = dbpath;
        this.collectionName = collectionName;
    }

    async saveState(context: Context, newState: any): Promise<any> {
        try {
            const collection = await this.db.collection(`state_${MongoDB.safeCollectionName(context.name)}`);
            return collection.replaceOne({ _id: newState[context.name] }, newState, {
                upsert: true,
            });
        } catch (error) {
            console.log(error);
        }
    }

    async getState(context: Context): Promise<any> {
        try {
            const collection = await this.db.collection(`state_${MongoDB.safeCollectionName(context.name)}`);
            return collection.findOne({ _id: context.value });
        } catch (error) {
            console.log(error);
        }
    }

    async connect() {
        this._client = new MongoClient(this.dbpath, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await this._client.connect();
        const db = await this._client.db();
        const collection = await db.collection(this.collectionName);
        const sequences = await db.collection('__sequences');
        collection.createIndex({
            seq: 1,
        });
        collection.createIndex({
            seq: -1,
            snapshot: 1,
        });

        const seq = await sequences.findOne({ _id: SEQ_ID });
        if (!seq) {
            await sequences.insertOne({ _id: SEQ_ID, sequence_value: 1 });
        }

        this.db = db;
        this.collection = collection;
        this.sequences = sequences;
    }

    async disconnect() {
        await this._client.close();
    }

    async getNextSequenceValue() {
        const sequenceDocument = await this.sequences.findOneAndUpdate(
            { _id: SEQ_ID },
            { $inc: { sequence_value: 1 } }
        );

        if (!sequenceDocument.value) {
            throw new Error('invalid sequence value');
        }

        return sequenceDocument.value.sequence_value;
    }

    insertEvent = async (evt: any) => {
        const decorated: Event = Object.assign({}, evt, {
            _id: v1(),
            seq: await this.getNextSequenceValue(),
        }) as Event;

        return this.collection.insertOne(decorated);
    };

    getEvents = async (context: Context, seq: number = 0): Promise<Event[]> => {
        const query: any = { [context.name]: context.value };
        if (seq) {
            query.seq = {
                $gte: seq,
            };
        }
        const docs = await this.collection.find(query).sort({ seq: 1 }).toArray();

        return docs.map((l: Event) => {
            delete l._id;
            return l;
        });
    };

    getSnapshot(context: Context): Promise<Event> {
        return this.collection.findOne({ [context.name]: context.value, isSnapshot: true });
    }
}

export default { MongoDB };
